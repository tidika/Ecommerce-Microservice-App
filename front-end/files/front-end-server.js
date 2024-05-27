const express = require("express") 
//const session = require('express-session')
var request      = require("request")
var bodyParser   = require("body-parser")
var cookieParser = require("cookie-parser")
var async        = require("async")
var http = require("http")
var cookie_name = "logged_in"
var session1= {
    name: 'md.sid',
    secret: 'sooper secret',
    resave: false,
    saveUninitialized: true
}
const app = express() 
 var helpers = {};
/* Public: errorHandler is a middleware that handles your errors
   *
   * Example:
   *
   * var app = express();
   * app.use(helpers.errorHandler);
   * */
  helpers.errorHandler = function(err, req, res, next) {
    var ret = {
      message: err.message,
      error:   err
    };
    res.
      status(err.status || 500).
      send(ret);
  };
  helpers.mylogger = function(req, res, next) {

   console.log('body '+JSON.stringify(req.body));
    next();
  };

  helpers.sessionMiddleware = function(err, req, res, next) {
    if(!req.cookies.logged_in) {
      res.session.customerId = null;
    }
  };

  /* Responds with the given body and status 200 OK  */
  helpers.respondSuccessBody = function(res, body) {
    helpers.respondStatusBody(res, 200, body);
  }

  /* Public: responds with the given body and status
   *
   * res        - response object to use as output
   * statusCode - the HTTP status code to set to the response
   * body       - (string) the body to yield to the response
   */
  helpers.respondStatusBody = function(res, statusCode, body) {
    res.writeHeader(statusCode);
    res.write(body);
    res.end();
  }

  helpers.respondStatusBodyJSON = function(res, statusCode, body) {
    res.writeHeader(statusCode);
    res.write(JSON.stringify(body));
    res.end();
  }

  /* Responds with the given statusCode */
  helpers.respondStatus = function(res, statusCode) {
    res.writeHeader(statusCode);
    res.end();
  }

  /* Public: performs an HTTP GET request to the given URL
   *
   * url  - the URL where the external service can be reached out
   * res  - the response object where the external service's output will be yield
   * next - callback to be invoked in case of error. If there actually is an error
   *        this function will be called, passing the error object as an argument
   *
   * Examples:
   *
   * app.get("/users", function(req, res) {
   *   helpers.simpleHttpRequest("http://api.example.org/users", res, function(err) {
   *     res.send({ error: err });
   *     res.end();
   *   });
   * });
   */
  helpers.simpleHttpRequest = function(url, res, next) {
    request.get(url, function(error, response, body) {
      if (error) return next(error);
      helpers.respondSuccessBody(res, body);
    }.bind({res: res}));
  }

  /* TODO: Add documentation */
  helpers.getCustomerId = function(req, env) {
    // Check if logged in. Get customer Id
    var logged_in = req.cookies.logged_in;

    // TODO REMOVE THIS, SECURITY RISK
    if (env == "development" && req.query.custId != null) {
      return req.query.custId;
    }

    if (!logged_in) {
      if (!req.session.id) {
        throw new Error("User not logged in.");
      }
      // Use Session ID instead
      return req.session.id;
    }

    return req.session.customerId;
  }


endpoints={
catalogueUrl:  process.env.CATALOGUE_URL || "http://localhost:3002",
   newProductUrl:  process.env.CATALOGUE_URL || "http://localhost:3002",
    tagsUrl:       "http://localhost:8082/catalogue/tags",
  //catalogueUrl:  "http://localhost:8081",
  // tagsUrl:       "http://localhost:8081",
    cartsUrl:     process.env.CART_URL || "http://localhost:3003",
    ordersUrl:     "http://orders",
    customersUrl:  "http://localhost:8080/customers",
    addressUrl:    "http://localhost:8080/addresses",
    cardsUrl:      "http://localhost:8080/cards",
    loginUrl:      "http://localhost:3001/login",
    registerUrl:   "http://localhost:3001/register",
};	
// Port Number Setup 
var PORT = process.env.port || 3000 
app.use(express.static("public"));
//app.use(session(session1));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helpers.errorHandler);
//app.use(helpers.sessionMiddleware);
// Session Setup 


app.get("/", function(req, res){ 
	
	// req.session.key = value 
	req.session.name = 'GeeksforGeeks'
	return res.send("Session Set") 
}) 

// Get the value of CATALOGUE_PORT environment variable
const cataloguePortStr = process.env.CATALOGUE_PORT;

// Convert the string value to a numeric type (integer)
const cataloguePort = parseInt(cataloguePortStr, 10);

app.get("/getProducts", function (req, res, next) {
   // var x = endpoints.catalogueUrl+"/getProducts" ;//+ req.url.toString();
    console.log("getProducts ");
    // var options = {
    //     host: "localhost",
    //     path: '/getProducts',
    //     port: 3002
    // };
    var options = {
        host: process.env.CATALOGUE_HOST || "localhost", 
        path: '/getProducts',
        port: cataloguePort || 3002
    };
    callback = function(response) {
        var str = '';

        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            console.log(str);
            res.end(str);
        });
    }

    http.request(options, callback).end();
  });


app.get("/cart", function (req, res, next) {
    console.log("Request received: " + req.url );//+ ", " + req.query.custId);
  //  var custId = helpers.getCustomerId(req, app.get("env"));
    //console.log("Customer ID: " + custId);
    request(endpoints.cartsUrl + "/cart",
        function (error, response, body) {
            if (error) {
                return next(error);
            }
            res.writeHeader(response.statusCode);
            res.write(body);
            res.end();
        });
});

//I implemented this
// Delete item from cart
app.post("/delete", function (req, res, next) {
    console.log("Attempting to delete from cart: " + JSON.stringify(req.body));
    console.log("Delete item from cart: " + req.body.id);

    var options = {
        uri: endpoints.cartsUrl + "/cart" + "/items/" + req.body.id.toString(),
        method: 'DELETE'
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error("Error occurred during delete request:", error);
            return next(error);
        }
        console.log('Item deleted with status: ' + response.statusCode);
        res.status(200).send("Item removed from cart");
    });
});


//I implemented this
//Add new item to cart
app.post("/cart", function (req, res, next) {
    console.log("Attempting to add to cart: " + JSON.stringify(req.body));

    if (req.body.id == null) {
        next(new Error("Must pass id of item to add"), 400);
        return;
    }

    var qty = req.body.qty;
    var options = {
        uri: endpoints.catalogueUrl + "/getProduct",
        method: 'GET',
        json: true,
        body: {id: req.body.id}
    };
    console.log("GET product: "
        + options.uri + " body: " + JSON.stringify(options.body));

    request(options,
        function (error, response, item) {
            console.log(item);
            console.log(" product id " + item.productID);
            var options1 = {
                uri: endpoints.cartsUrl + "/add",
                method: 'POST',
                json: true,
                body: {
                    productID: item.productID,
                    price: item.price,
                    quantity: qty,
                    image: item.image,
                    name: item.name
                }
            };
            json_body = JSON.stringify(options1.body)
            console.log("POST to carts: " + options1.uri

                + " body: " + json_body);
            request(options1, function (error, response, body) {
                if (error) {
                    // Handle error
                    console.error("Error occurred while adding item to cart:", error);
                    res.status(500).send("An error occurred while adding item to cart.");
                } else {
                    if (response.statusCode === 201) {
                        console.log("Item added successfully to cart:", json_body);
                        // res.status(201).send("Item added successfully to cart."); 
                    } else {
                        console.error("Failed to add item to cart. Server responded with status:", response.statusCode);
                        res.status(response.statusCode).send("Failed to add item to cart.");
                    }
                }
            });
                
        });

});

// Create Customer - TO BE USED FOR TESTING ONLY (for now)
app.post("/register", function(req, res, next) {
    var options = {
        uri: endpoints.registerUrl,
        method: 'POST',
        json: true,
        body: req.body
    };

    console.log("Posting Customer: " + JSON.stringify(req.body));
    request(options, function(error, response, body) {
        if (error !== null ) {
            console.log("error "+JSON.stringify(error));
            return;
        }
        if (response.statusCode == 200 &&
            body != null && body != "") {
            if (body.error) {
                console.log("Error with log in: " + err);
                res.status(500);
                res.end();
                return;
            }
            console.log(body);
           /* var customerId = body.id;
            console.log(customerId);
            req.session.customerId = customerId;
            console.log("set cookie" + customerId);
            res.status(200);
            res.cookie(cookie_name, req.session.id, {
                maxAge: 3600000
            }).send({id: customerId});
            console.log("Sent cookies.");*/

            res.end();
            return;
        }
        console.log(response.statusCode);

    });

});

//I Implemented this
app.post("/newProduct", function(req, res, next) {
    console.log("Posting new Product: " + JSON.stringify(req.body));
    // Extract data from the request body
    const productData = req.body;

    // Make HTTP POST request to catalogue Microservice
    request.post({
        url: `http://${process.env.CATALOGUE_HOST || 'localhost'}:${cataloguePort || '3002'}/newProduct`,
        // url: /newProduct || 'http://localhost:3002/newProduct',
        json: productData
    }, function(error, response, body) {
        if (error) {
            // Handle error
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        } else {
            // Forward response from Microservice B to client
            console.log('Response:', body);
            res.status(response.statusCode).send(body);
        }
    });

});

app.post("/login", function(req, res, next) {
    var options = {
        uri: endpoints.loginUrl,
        method: 'POST',
        json: true,
        body: req.body
    };

    console.log("Posting Customer: " + JSON.stringify(req.body));
    request(options, function(error, response, body) {
        if (error !== null ) {
            console.log("error "+JSON.stringify(error));
            return;
        }
        if (response.statusCode == 200 &&
            body != null && body != "") {
            //     body = JSON.parse(body);
            console.log('body '+JSON.stringify(body))
            if (body.error) {
                console.log("Error with log in: " + body.error);
                res.status(500);
                res.end();
                return;
            }
            console.log(body);

            /*   var customerId = body.id;
            console.log('cust id ' +customerId);
            req.session.customerId = customerId;
            console.log("set cookie" + customerId);
            res.status(200);
            res.cookie(cookie_name, req.session.id, {
                maxAge: 3600000
            });//.send({id: customerId});
            console.log("Sent cookies.");*/

            res.end("logged in as "+ req.body.name);
            return;
        }
        console.log(response.statusCode);

    });

});

app.listen(PORT, function(error){ 
	if(error) throw error 
	console.log("Server created Successfully on PORT :", PORT) 
}) 


