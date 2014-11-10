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
    scrapeAll(function next (err, results){
        //add results to db
    }
updateSingleProd(productUrl, function next(err, result){
        //add result to db
    }

*/

var scraped = require('./cvs_scraper');
scraped.scrapeAll(function(err, result){
    console.log(result);
});