// app/routes.js

module.exports = function(app, passport) {

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
//  app.get('/login', function(req, res) {
//    console.log('hello??');
//    // render the page and pass in any flash data if it exists
//    res.render('login.ejs', { message: req.flash('loginMessage') });
//  });

  // process the login form
  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      console.log(info);
      if (err) { return next(err); }
      if (!user) {
        return res.send(info);
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.send(200);
      });
    })(req, res, next);
  });

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
//  app.get('/signup', function(req, res) {
//    console.log('test');
//    // render the page and pass in any flash data if it exists
//    res.json({ message: req.flash('signupMessage') });
//  });

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
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
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