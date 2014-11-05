var common = require('../common/common.js');
var productDB = require('../models/product.js');
// app/routes.js
module.exports = function (app, passport) {
    
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    app.get('/products', function (req, res) {
        productDB.find().exec(function (err, products) {
            // Quick hack to put *something* in the database if nothing is there. Remove when proper CRUD is enabled
            if (products.length === 0) {
                var p1 = new productDB();
                var p2 = new productDB();

                p1.name = "Ebola Spray";
                p1.price = 9.99;
                p1.imageurl = "http://i.imgur.com/uJg4bh2.jpg";
                p1.lastAccess = new Date();
                p1.save();

                p2.name = "Lysol";
                p2.price = 23.98;
                p2.imageurl = "/images/exampleimage.jpg";
                p2.lastAccess = new Date();
                p2.save();
            }
            res.json(products);
        });
    });

    app.get('/products/:pid', function (req, res) {
        var pId = req.param("pid");
        productDB.findById(pId, function (err, product) { 
            res.json(product);
        });
    });
};