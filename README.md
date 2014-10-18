**Intel-PWNED**
===========

Current Requirements to run:

MongoDB (must be running)
NodeJS

**Installation:**

    npm install
    
  and then run
  
    node server.js

**Structure:**

**app/models** is where DB schemas are stored

**common** is where I put common functionality I need across multiple files that I
haven't 'modulized' yet.

**public** is a 'webroot' for serving static files (images/stylesheets/etc)

**routes** contains routing functions (ex '/' is the root).

**views** contains markup information using EJS template.
