Intel-PWNED
==========

Requirements
-------------------

####Install MongoDB

http://docs.mongodb.org/manual/installation/

####Install NodeJS

http://nodejs.org/download/

Setup
---------

Note: MongoDB must be running (see MongoDB Install guide).

####1. Change directory

Make sure you are in `pwnedapp/pwnedapp`

####2. Initialize

1. Run `bower install`. **You only need to do this once to install packages.**

2. Run `npm install`. **You only need to do this once to install dependencies.**

3. Run `grunt default` to concatenate and minify all required javascript. If you add or modify new components or client-side Javascript, you will need to modify Gruntfile.js and run this again.

####3. Start the app

Run `node server.js` to start the server.

In your browser, navigate to `http://localhost:8080/`

Structure:
-------------

**/models** is where DB schemas are stored

**/common** is where I put common functionality I need across multiple files that I
haven't 'modulized' yet.

**/public** is a 'webroot' for serving static files (images/stylesheets/etc)

**/routes** contains routing functions (ex '/' is the root).

**/views** contains partials

**/components** contains directives
