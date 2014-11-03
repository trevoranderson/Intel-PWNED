// app/routes.js
var productDB = require('../models/product.js');
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