/**
 * Created by kevinlin on 10/28/14.
 *
Standard scraper format

Requirements:
    must be asynchronous
    must have a private constant for rate-limiting requests
    must follow interface rules

Initialization:
    var scrapeObject = require(“your script”)

Interface:
    scrapeAll(next)
    updateSingleProd(productUrl, next)
Usage:

    - results is an array of entries following db schema
    scrapeAll(function next (err, results){
        //add results to db
    }
    - result is single entry
updateSingleProd(productUrl, function next(err, result){
        //add result to db
    }
    PLEASE SEE PRODUCT.JS FOR SCHEMA DECLARATION



*/

var scraped = require('./cvs_scraper');
scraped.scrapeAll(function(err, result){
    console.log(result);
});

scraped.updateSingleProduct('http://www.cvs.com/shop/beauty/eyes/eye-shadow/milani-shadow-singles-bella-chiffon-skuid-967395', function(err, result){
    console.log(result);
});