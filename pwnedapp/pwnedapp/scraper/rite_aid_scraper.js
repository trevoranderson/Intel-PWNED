/*
Flow of program:
1. Send a seed async call to shop.riteaid.com
2. Crawl through categories and add all product URL's to productQueue
3. Once there are no more requests pending, start scraping product URL's at X requests per minute
4. Output each product info to console/update db
*/



//request: sending async requests for HTML
//cheerio: creating dom object from html
//async: serializing async requests
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var configDB = require('../config/database.js');
var mongoose = require('mongoose');
var productDB = require('../models/product.js');

var SCRAPER_SITE = "Rite Aid";
var siteUrl = 'http://shop.riteaid.com';
var TIME_BETWEEN_REQUESTS = 200;

var productQueue = [];
var globalResultArr = [];

// ==== Function declarations go here =====

/*/connect to DB
mongoose.connect(configDB.url, function (err) {
    if(err)
        console.log ("DB Connection Error " + err);
});
*/

var numberOfRequests = 0;

function incrementRequests(){
    numberOfRequests++;
}
function decrementRequests(){
    numberOfRequests--;
}

/**
 * Given an inputURL it extracts the categories from that page and visits each of them.
 * Currently only consists of Beauty and Personal Care
 *
 * @param inputUrl URL containing the category list
 */
function sendInitialRequest(inputUrl){
    incrementRequests();
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        console.log("Scraping categories:");
        $('#left-navi li').each(function(index){
            if(index != 3 && index != 4){return;}  //Excluding anything that is not Beauty or Personal Care
            var nextLink = $(this).find('a').attr('href') + "?limit=72";
            console.log("\t" + nextLink);
            scrapeSingleCategoryPage(nextLink, 1);
        });
        decrementRequests();
    }).setMaxListeners(0);
}

/**
 * Given a category url it will proceed to grab all the product urls and add them to a queue.
 * It will start scraping from the page parameter (set page=1 for to get all pages).
 * All product urls will be placed in a queue and WILL NOT be visited by this function.
 *
 * @param inputUrl Category URL to scrape
 * @param page Page number to scrape
 */
function scrapeSingleCategoryPage(inputUrl, page){
    incrementRequests();

    var categoryPage = inputUrl + "&p=" + page;
    request(categoryPage, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

        //check that we haven't gone over the max page
        var currPage = $("li[class='current number-btn']").first().text();
        if( currPage != page ) {
            console.log("Finished: " + categoryPage);
            decrementRequests();
            return;
        }

        //add the product URL to the queue
        $('.product-name a').each(function(index){
            var nextLink = $(this).attr('href');
            console.log("Product: " + nextLink);
            productQueue.push(nextLink);
        });

        //comment this line out to only grab the first page of every category
        //scrapeSingleCategoryPage(inputUrl, page+1);

        decrementRequests();
    }).setMaxListeners(0);

}

/**
 * This function waits until there are no more requests being made.
 * After it has completed it will run the whenDone() function.
 *
 * @param whenDone Function to be executed after category scraping completes
 */
function waitTillDone(whenDone){
    if(numberOfRequests != 0){
        console.log("Waiting for requests / Requests Remaining: " + numberOfRequests);
        setTimeout(function(){waitTillDone(whenDone);}, 10000);
    }
    else {
        whenDone();
    }
}

var sendSyncedProductRequest = function(cbSize, cb) {
    if(!cb){
        cb = cbSize;
        cbSize = null;
    }
    var index = 0;
    async.eachSeries(productQueue,
        function (url, callback) {
            console.log("Getting " + url);
            getProductPage(url, function(){setTimeout(callback, TIME_BETWEEN_REQUESTS);});
            if(cbSize && ((index % cbSize) === cbSize-1)){
                cb(null, globalResultArr);
                globalResultArr = [];
            }
            index++;
        },
        function (err) {
            if(err){
                cb(err, null);
            }
            else
                cb(null , globalResultArr);
        });
}

//for synchronously sending a batch of product requests
function getProductPage(productUrl, callback) {
    sendProductRequest(productUrl, function(err, res){
        if(err){
            console.log(err);
        }
        else {
            if(res)
                globalResultArr.push(res);
            callback();
        }
    });
}


function sendProductRequest(productUrl, cb) {
    request(productUrl, function (err, resp, body) {
        if (err)
            throw err;

        $ = cheerio.load(body);
        
        var name = $("div.product-name").find("[itemprop='name']").text();
        var price = $("div.price-box").find("[itemprop='price']").text();
        //var name = $("[itemprop='name']").text();
        //var price = $("[itemprop='price']").text();
        var imgUrl = $("div.product-img-box").find("[itemprop='image']").attr('src');
        var lastaccess = Date(Date.now()).toString();
        var overview = "";
        var ingredients = "";

        //extract tab section
        var tab_selector = $("#collateral-tabs");

        //if there is a tab section look for the overview and ingredients
        if( tab_selector.length != 0 ) {
            var dt_selector = tab_selector.find("dt.tab");              //tab names
            var dd_selector = tab_selector.find("dd.tab-container");    //tab contents

            dt_selector.each(function(index){
                //if we found the overview section extract its corresponding text
                if( $(this).text() == "Details" ) {
                    if( index < dd_selector.length ) {
                        var temp = $(dd_selector[index]).text();
                        var truncate_index = temp.indexOf('\tvar');
                        if( truncate_index >= 0 ) {
                            overview = temp.substring(0, truncate_index).trim();
                        } else {
                            overview = temp;
                        }
                    }
                } else if( $(this).text() == "Ingredients" ) {
                    if( index < dd_selector.length ) {
                        ingredients = ($(dd_selector[index]).text()).trim().split(',');
                        var last = ingredients[ingredients.length-1];
                        ingredients[ingredients.length-1] = last.substring(0, last.length-1);
                    }
                }
            });
        }

        var p = {
                    name: name,
                    price: price,
                    imageurl: imgUrl,
                    producturl: productUrl,
                    overview: overview,
                    ingredients: ingredients,
                    scraperParams: {
                        site: SCRAPER_SITE,
                        lastAccess: lastaccess
                    }
        };

        /*
        //DB insertions
        var zz = new productDB();
        zz.name = p.name;
        zz.price = p.price.substring(1);
        zz.imageurl = p.imageurl;
        zz.producturl = p.producturl;
        zz.overview = p.overview;
        zz.ingredients = p.ingredients;
        zz.scraperParams = p.scraperParams;
        zz.save(function (err, fluffy) {
        if (err) 
            return console.error(err);
        });
        */
        
        cb(null, p);
    }).setMaxListeners(0);
}

exports.scrapeAll = function (cbSize, cb){
    sendInitialRequest(siteUrl);
    waitTillDone(function() {sendSyncedProductRequest(cbSize, cb);});
}

//for just getting one product request
function updateSingleProduct(productUrl, next){
    sendProductRequest(productUrl, function(err, res){
        if(err){
            next(err, null);
        }
        else
            next(null, res);
    });
}

exports.updateSingleProduct = updateSingleProduct;
