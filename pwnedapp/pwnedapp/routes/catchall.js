var common = require('../common/common.js');
var productDB = require('../models/product.js');
// app/routes.js
module.exports = function (app, passport) {
    
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('../index.html'); // load the index.ejs file
    });
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
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
//    app.get('/login', function (req, res) {
//
//        // render the page and pass in any flash data if it exists
//      res.sendfile('../index.html');
//    });
//
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
//    app.get('/signup', function (req, res) {
//
//        // render the page and pass in any flash data if it exists
//      res.sendfile('/index.html');
//    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
//    app.get('/profile', common.isLoggedIn, function (req, res) {
//        res.render('profile.ejs', {
//            user : req.user // get the user out of session and pass to template
//        });
//    });
    
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};