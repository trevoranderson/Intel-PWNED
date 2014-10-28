// app/routes.js

module.exports = function(app, passport) {

  // =====================================
  // LOGIN ===============================
  // =====================================

  // process the login form
  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
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

  // process the signup form
  app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
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
  // PROFILE SECTION =========================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  app.post('/profile', isLoggedIn, function(req, res) {
    res.send({ user : req.user });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.post('/api/logout', function(req, res) {
    req.session.destroy();
    req.logout();
  });

  // =====================================
  // IS LOGGED IN ========================
  // =====================================

  app.post('/api/loggedIn', function(req, res) {
    if (req.isAuthenticated()) {}
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