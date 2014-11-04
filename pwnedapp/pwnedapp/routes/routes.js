// app/routes.js
"use strict";
var fn = require('fn.js');
var productDB = require('../models/product.js');
var userDB = require('../models/user.js');
module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.sendfile('index.html');
    });
    app.get('/products/search/:query', function (req, res) {
        productDB.find({ name: new RegExp(req.param("query"), 'i'), }).exec(function (err, products) {
            res.json(products);
        });
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
    
    // C[ru]D operations for user's watchlist
    // get the products in their watchlist.
    app.get('/watchlist', isLoggedIn, function (req, res) {
        userDB.findById(req.user.id).exec(function (err, user) {
            productDB.find({
                _id: { $in: user.watchlist }
            }, function (err, products) { 
                res.json(fn.map(function (pId) {
                    return fn.filter(function (p) { 
                        return p.id === pId;
                    }, products)[0];
                }, user.watchlist));
            });
        });
    });
    // Add a product by ID
    app.get('/watchlist/add/:pid', isLoggedIn , function (req, res) {
        var pId = req.param("pid");
        productDB.findById(pId, function (err, product) {
            if (err || !product) {
                res.json({
                    status: "error",
                    description: "product with id: " + pId + " not found",
                });
                return;
            }
            //update user
            userDB.findById(req.user.id).exec(function (err, user) {
                if (err) {
                    res.json({ status: "error", description: "couldn't find user or something" });
                    return;
                }
                if (user.watchlist.indexOf(pId) === -1) {
                    // Doesn't exist
                    user.watchlist.length++;
                    user.watchlist.set(user.watchlist.length - 1, pId);
                    user.save(function (err) {
                        if (err) {
                            res.json({ status: "error", description: "I have no idea what went wrong" });
                            return;
                        }
                        res.json({ status: "success", description: "Added product with Id " + pId + " to watchlist" });
                    });
                }
                else {
                    //already added. not an error though
                    res.json({ status: "success", description: "Product already in watchlist" });
                }
            });
        });
    });
    // Remove a product by ID
    app.get('/watchlist/rm/:pid', isLoggedIn , function (req, res) {
        var pId = req.param("pid");
        productDB.findById(pId, function (err, product) {
            if (err || !product) {
                res.json({
                    status: "error",
                    description: "product with id: " + pId + " not found",
                });
                return;
            }
            //update user
            userDB.update({ _id: req.user.id }, {
                $pull: { "watchlist": pId }
            }, function (err, result) {
                res.json({
                    status: "success",
                    description: "product with id: " + pId + " removed from watchlist",
                });
            });
        });
    });
    // =====================================
    // LOGIN ===============================
    // =====================================
    
    // process the login form
    app.post('/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) {
                return res.send(info);
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                return res.send(200);
            });
        })(req, res, next);
    });
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    
    // process the signup form
    app.post('/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) {
                return res.send(info);
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                return res.send(200);
            });
        })(req, res, next);
    });
    
    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    app.post('/profile', isLoggedIn, function (req, res) {
        res.send({ user : req.user });
    });
    
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.post('/api/logout', function (req, res) {
        req.session.destroy();
        req.logout();
        res.send(200);
    });
    
    // =====================================
    // IS LOGGED IN ========================
    // =====================================
    
    app.post('/api/loggedIn', function (req, res) {
        if (req.isAuthenticated()) {
            res.send({ email : req.user.email });
        }
    });

};

// route middleware to make sure
function isLoggedIn(req, res, next) {
    
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}