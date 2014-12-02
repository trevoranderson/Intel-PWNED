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
    ** OPTIONAL: scrapeAll(cbSize, next) where cbSize specifies to return results in chunks of cbSize **
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
scraped.scrapeAll(30, function(err, result){
    console.log(result);
});

scraped.updateSingleProduct('http://www.cvs.com/shop/beauty/lips/lip-balm/almay-color-care-liquid-lip-balm-apple-a-day-300-skuid-921034', function(err, result){
    console.log(result);
});
