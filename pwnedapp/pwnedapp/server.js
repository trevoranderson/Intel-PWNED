// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms (depending on how we structure, probably can just call when needed)

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'idontevenknowwhatthisisforbutillputalongstringanyways' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

  app.use(express.static(__dirname + '/'));
  app.use('/bower_components', express.static(__dirname + '/bower_components'));
  app.use('/components', express.static(__dirname + '/components'));

});

// routes ======================================================================
require('./routes')(app, passport); // load our routes and pass in our app and fully configured passport

// load the single view file (angular will handle the page changes on the front-end)
app.get('*', function(req, res) {
  res.sendfile('index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
