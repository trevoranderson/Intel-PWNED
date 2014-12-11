/*
Flow of program:
1. Send a seed async call to http://www.lorealparisusa.com/
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

//for running the phantom script -> retrieves AJAX stuff
var childProcess = require('child_process');
var phantomjs    = require('phantomjs');
var exePath      = phantomjs.path;
var path         = require('path');

var SCRAPER_SITE = "L'oreal";
var siteUrl = 'http://www.lorealparisusa.com';
var TIME_BETWEEN_REQUESTS = 200;

var productQueue = [];
var globalResultArr = [];

// ==== Function declarations go here =====

//connect to DB
mongoose.connect(configDB.url, function (err) {
    if(err)
        console.log ("DB Connection Error " + err);
});

var numberOfRequests = 0;

function incrementRequests(){
    numberOfRequests++;
}
function decrementRequests(){
    numberOfRequests--;
}

/**
 * Given an inputURL it extracts the categories from that page and visits each of them.
 * Currently only consists of Makeup, Hair, Skin care
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
        $('.group li').each(function(index){
            if(index != 0 && index != 1 && index != 2){return;}  //Excluding anything that is not Makeup, Hair, Skin care
            var nextLink = siteUrl + $(this).find('a').attr('href');
            console.log("\t" + nextLink);
            scrapeCategoryPage(nextLink);
        });
        decrementRequests();
    });
}

/**
 * Given a category url it will proceed to grab all the subcategories on that page and scrape those.
 *
 * @param inputUrl Category URL to scrape
 */
function scrapeCategoryPage(inputUrl){
    incrementRequests();
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        console.log("Scraping subcategories:");
        $('div.category li').each(function(index){
            var nextLink = siteUrl + $(this).find('a').attr('href');
            console.log("\t" + nextLink);
            scrapeSubCategoryPage(nextLink);
        });
        decrementRequests();
    });
}

/**
 * Given a subcategory url it will proceed to grab all the product urls and add them to a queue.
 * All product urls will be placed in a queue and WILL NOT be visited by this function.
 *
 * @param inputUrl Category URL to scrape
 */
function scrapeSubCategoryPage(inputUrl){
    incrementRequests();

    var categoryPage = inputUrl;
    request(categoryPage, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

        //add product URLs from first page to the queue
        $('div.wrap.products-container').find('article.module-product-box').each(function(index){
            var nextLink = siteUrl + $(this).find('a').attr('href');
            console.log("Product: " + nextLink);
            productQueue.push(nextLink);
        });

        //add product URLs from the other pages to the queue
        loadPagesWithPhantom(inputUrl);

        decrementRequests();
    });
}


function loadPagesWithPhantom(url){
    incrementRequests();
    var childArgs = [path.join(__dirname, 'loreal_phantom.js'), url];
    childProcess.execFile(exePath, childArgs, {maxBuffer:1024*1024}, function(err, stdout, stderr){
        //parse stdout by newlines and add to queue
        stdout.split("\n").forEach(function(element, index, array) {
            if( element != "" ) {
                var nextLink = siteUrl + element;
                console.log("Product: " + nextLink);
                productQueue.push(nextLink);
            }
        });

        decrementRequests();
    });
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
                cb(null, globalResultArr.slice(index-(cbSize -1), index));
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
        if (err) {
            if( err.toString().indexOf("redirect loop") > -1 ) {
                console.log("REDIRECT LOOP - OVERRIDING");
                return cb(null, null);
            }
            throw err;
        }

        $ = cheerio.load(body);
        
        var product_info = $('div.product-content');
        var images = $('div.product-slider-container');

        var name = product_info.find('h1').text().trim();
        var price = product_info.find('div.buy-section span').text();
        var imgUrl = siteUrl + images.find('img').first().attr('src');
        var lastaccess = Date(Date.now()).toString();
        var overview = "";
        var ingredients = "";

        //extract tab section
        var tab_selector = product_info.find('div.product-description-container').find('div.product-description');

        //if there is a tab section look for the overview and ingredients
        if( tab_selector.length != 0 ) {
            var name_selector = tab_selector.find('a');        //tab names
            var contents_selector = tab_selector.find('div');  //tab contents

            name_selector.each(function(index){
                //if we found the overview section extract its corresponding text
                if( $(this).attr('href') == "#description" ) {
                    if( index < contents_selector.length ) {
                        overview = $(contents_selector[index]).text().trim();
                    }
                } else if( $(this).attr('href') == "#ingredients" ) {
                    if( index < contents_selector.length ) {
                        var temp_ingred = $(contents_selector[index]).text();
                        if( temp_ingred.indexOf("•") >=0 ) {
                            ingredients = $(contents_selector[index]).text().trim().split('•');
                        } else if( temp_ingred.indexOf(",") >=0 ) {
                            ingredients = $(contents_selector[index]).text().trim().split(',');
                        } else {
                            ingredients = $(contents_selector[index]).text().trim().split('\n');
                        }
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
        //-------------     
        cb(null, p);
    });
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

//===============================================
//                  PHANTOM TESTS
//===============================================
//loadPagesWithPhantom(null, "http://www.lorealparisusa.com/en/Products/Skin-Care/Moisturizers.aspx");
//loadPagesWithPhantom(null, "http://www.lorealparisusa.com/en/Products/Skin-Care/Self-Tanner.aspx");