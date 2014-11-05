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

####3. Start the app

1. Run `grunt default` to concatenate and minify the Angular code and packages. This will also start watching for changes in these files, and will concat/uglify automatically again if code is changed.
2. Run `node server.js` to start the server.

In your browser, navigate to `http://localhost:8080/`

Structure:
-------------

**/models** is where DB schemas are stored

**/common** is where I put common functionality I need across multiple files that I
haven't 'modulized' yet.

**/public** is a 'webroot' for serving static files (images/stylesheets/etc)

**/routes** contains routing functions (ex '/' is the root).

**/views** contains partials

**/components** contains components for the client-side
