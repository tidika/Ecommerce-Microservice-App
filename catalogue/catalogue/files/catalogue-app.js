var http = require('http'),
    fs = require('fs'),
    url = require('url');
var p = require('path');
var qs = require('querystring');
var mysql = require('mysql2');
var root = __dirname;
var headers = [
    "Product Name", "Price", "Picture", "Buy Button"
];


var dbHost = process.env.DB_HOST || 'localhost'; // Default to localhost
var dbName = process.env.DB_NAME || 'shop'; // Default to 'shop'
var dbPassword = process.env.DB_ROOT_PASSWORD || ''; // Default to empty string

var db = mysql.createConnection({
    host:     dbHost,
    user:     'root', // Assuming the user is 'root'
    password: dbPassword,
    database: dbName
});

var cart = [];
var theuser=null;
var theuserid =null;
var server = http.createServer(function (request, response) {
    var path = url.parse(request.url).pathname;
    var url1 = url.parse(request.url);
    if (request.method == 'POST') {
        switch (path) {

            // Implemented this
            case "/newProduct":
                var body = '';
                console.log("new Product");
                request.on('data', function(data) {
                    body += data;
                });
                request.on('end', function() {
                    var productData = JSON.parse(body);
                    var name = productData.name;
                    var quantity = productData.quantity;
                    var price = productData.price;
                    var picture = productData.picture;
                    console.log('Received payload data from Microservice A:', productData);
                    console.log('Received payload product name is:', name);

                    // Validating the input values
                    if (name.trim() === '') {
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('Product name is required.');
                        return;
                    }

                    if (isNaN(quantity) || quantity.trim() === '') {
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('Quantity must be a number.');
                        return;
                    }
                    
                    if (isNaN(price) || price.trim() === '') {
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('Price must be a number.');
                        return;
                    }
                
                    // Increment product ID based on the last ID in the database
                    var query = "SELECT MAX(productID) AS maxId FROM products";
                    db.query(query, function (err, result) {
                        if (err) {
                            console.error('Error getting max product ID:', err);
                            response.writeHead(500, {'Content-Type': 'text/plain'});
                            response.end('Error adding product');
                        } else {
                            var nextProductId = result[0].maxId + 1;
                            console.log("Max id is: " + nextProductId);

                            // Check if the product name already exists
                            query = "SELECT COUNT(*) AS count FROM products WHERE name = ?";
                            db.query(query, [name], function(err, result) {
                                if (err) {
                                    console.error('Error checking product name:', err);
                                    response.writeHead(500, {'Content-Type': 'text/plain'});
                                    response.end('Error adding product');
                                } else {
                                    var productCount = result[0].count;
                                    if (productCount > 0) {
                                        console.log('Product with the same name already exists');
                                        response.writeHead(400, {'Content-Type': 'text/plain'});
                                        response.end('Product with the same name already exists');
                                    } else {
                                        // Insert product into database
                                        query = "INSERT INTO products (productID, name, quantity, price, image) VALUES (?, ?, ?, ?, ?)";
                                        db.query(query, [nextProductId, name, quantity, price, picture], function (err, result) {
                                            if (err) {
                                                console.error('Error inserting product:', err);
                                                response.writeHead(500, {'Content-Type': 'text/plain'});
                                                response.end('Error adding product');
                                            } else {
                                                console.log('Product inserted successfully');
                                                response.writeHead(200, {'Content-Type': 'text/plain'});
                                                response.end('Product added successfully');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });

                });
                break;
        } //switch
    }
    else {
        switch (path) {


            case "/getProducts"    :
                console.log("getProducts");
                response.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*'
                });
                var query = "SELECT * FROM products ";


                db.query(
                    query,
                    [],
                    function(err, rows) {
                        if (err) throw err;
                        console.log(JSON.stringify(rows, null, 2));
                        response.end(JSON.stringify(rows));
                        console.log("Products sent");
                    }
                );

                break;

            case "/getProduct"    :
                console.log("getProduct");
                var body="";
                request.on('data', function (data) {
                    body += data;
                });

                request.on('end', function () {
                    var product = JSON.parse(body);
                    response.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*'
                    });
                    console.log(JSON.stringify(product, null, 2));
                    var query = "SELECT * FROM products where productID="+
                        product.id;


                    db.query(
                        query,
                        [],
                        function(err, rows) {
                            if (err) throw err;
                            console.log(JSON.stringify(rows, null, 2));
                            response.end(JSON.stringify(rows[0]));
                            console.log("Product for cart sent");
                        }
                    );

                });

                break;

            case "/testEndpoint"    :
                console.log("Test endpoint called");
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end('This is a test endpoint');

                    break;

            case "/getTestProducts":
                console.log("getTestProducts");
                response.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*'
                });
                var query = "SELECT productID, name, quantity, price, image FROM products";

                db.query(
                    query,
                    [],
                    function(err, rows) {
                        if (err) throw err;
                        console.log(JSON.stringify(rows, null, 2));
                        response.write('<html><head><title>Products</title></head><body>');
                        response.write('<h1>Products</h1>');
                        response.write('<table border="1">');
                        response.write('<tr>');
                        response.write('<th>Product ID</th>');
                        response.write('<th>Name</th>');
                        response.write('<th>Quantity</th>');
                        response.write('<th>Price</th>');
                        response.write('<th>Image</th>');
                        response.write('</tr>');
                        rows.forEach(function(row) {
                            response.write('<tr>');
                            response.write('<td>' + row.productID + '</td>');
                            response.write('<td>' + row.name + '</td>');
                            response.write('<td>' + row.quantity + '</td>');
                            response.write('<td>' + row.price + '</td>');
                            response.write('<td>' + row.image + '</td>');
                            response.write('</tr>');
                        });
                        response.write('</table>');
                        response.write('</body></html>');
                        response.end();
                        console.log("Products sent");
                    }
                );

                break;
        }
    }

});

server.listen(3002, function() {
    console.log('Server is running on port 3002');
});
