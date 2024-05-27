var express = require("express")
    , morgan = require("morgan")
    , path = require("path")
    , bodyParser = require("body-parser")

    , app = express();


app.use(morgan('combined'));
app.use(morgan("dev", {}));
app.use(bodyParser.json());

//app.use(morgan("dev", {}));

var cart = [];

// implemented this
app.post("/add", function (req, res, next) {
    var obj = req.body;   
    console.log("Attempting to add to cart: " + JSON.stringify(req.body));

    // Check if the product already exists in the cart
    var existingItem = cart.find(item => item.productID === obj.productID);
    if (existingItem) {
        // If the item exists, update its quantity
        existingItem.quantity += parseInt(obj.quantity);
        console.log("Quantity added to existing item: " + existingItem.quantity);
    } else {
        // If the item doesn't exist, generate a new cart ID and add it to the cart
        var cartid = cart.length > 0 ? Math.max(...cart.map(item => item.cartid)) + 1 : 1;
        console.log("New cart ID: " + cartid);

        // Create a new cart item
        var data = {
            "cartid": cartid,
            "productID": obj.productID,
            "name": obj.name,
            "price": obj.price,
            "image": obj.image,
            "quantity": parseInt(obj.quantity)
        };

        // Add the new item to the cart
        cart.push(data);
    }

    // Send response
    res.status(201).send("Product added to cart successfully");
});


//implemented this
app.delete("/cart/items/:id", function (req, res, next) {
    var idToDelete = req.params.id; // Get the ID from the request parameters
    console.log("Delete item from cart with ID: " + idToDelete);

    // Find the selected student by ID
    var selectedcartitem = cart.find(function (item) {
        return item.cartid === parseInt(idToDelete);
    });
    
    //find the selected cartid position on the cart array
    var indexToDelete = cart.indexOf(selectedcartitem);

    // Check if the item exists in the cart
    if (indexToDelete !== -1) {
        // Remove the item from the cart array
        cart.splice(indexToDelete, 1);
        // console.log("Item removed from cart");
        res.status(200).send("Item removed from cart");;
        // res.status(201).send("Item removed from cart"); // Respond with success message
       
    } else {
        console.log("Item with ID " + idToDelete + " not found in cart");
        res.status(404).send("Item not found in cart"); // Respond with error message
    }
});


app.get("/cart", function (req, res, next) {


    //var custId = req.params.custId;
    //console.log("getCart" + custId);


    //console.log('custID ' + custId);


    console.log(JSON.stringify(cart, null, 2));

    res.send(JSON.stringify(cart));
    console.log("cart sent");

});


var server = app.listen(process.env.PORT || 3003, function () {
    var port = server.address().port;
    console.log("App now running in %s mode on port %d", app.get("env"), port);
});
