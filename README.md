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

####2. Initialize the app

Run to `bower install` to install packages (you only need to do this once).

Run `npm start`. This command automatically runs the following:

  - `npm install`: Installs dependencies 

  - `node server.js`: Starts the server

####3. View the app

In your browser, navigate to `http://localhost:8080/`

Structure:
-------------

**/models** is where DB schemas are stored

**/common** is where I put common functionality I need across multiple files that I
haven't 'modulized' yet.

**/public** is a 'webroot' for serving static files (images/stylesheets/etc)

**/routes** contains routing functions (ex '/' is the root).

**/views** contains partials
