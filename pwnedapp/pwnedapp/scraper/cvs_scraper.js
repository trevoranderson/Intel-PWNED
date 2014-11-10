/*
Flow of program:
1. Send a seed async call to cvs.com
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

var SCRAPER_SITE = "CVS Pharmacy";
var siteUrl = 'http://www.cvs.com';
var TIME_BETWEEN_REQUESTS = 1000;

var productQueue = [];
var globalResultArr = [];

// ==== Function declarations go here =====


var numberOfRequests = 0;

function incrementRequests(){
    numberOfRequests++;
}
function decrementRequests(){
    numberOfRequests--;
}

function sendInitialRequest(inputUrl){
    incrementRequests();
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        console.log("Scraping categories:");
        $('#shop-flyout .sublevel-nav li').each(function(index){
            if(index != 2 && index != 9){return;}  //Excluding anythings that's not Beauty and Skin Care
            var nextLink = siteUrl + $(this).find('a').attr('href');
            console.log("\t" + nextLink);
            scrapeCategoriesPage(nextLink);
        });
        decrementRequests();
    });
}

function waitTillDone(whenDone){
    if(numberOfRequests != 0){
        console.log("Waiting for requests / Requests Remaining: " + numberOfRequests);
        setTimeout(function(){waitTillDone(whenDone);}, 10000);
    }
    else {
        whenDone();
    }
}

var sendSyncedProductRequest = function(cb) {
    async.eachSeries(productQueue,
        function (url, callback) {
            console.log("Getting " + url);
            getProductPage(url, function(){setTimeout(callback, TIME_BETWEEN_REQUESTS);});
        },
        function (err) {
            if(err){
                cb(err, null);
            }
            else{
                cb(null , globalResultArr);
            }
        });
}


function scrapeCategoriesPage(inputUrl){
    incrementRequests();
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        var a = $('#sidebar-1 script').text();
        var nextLink = a.match(/"(\/.*)"/);
        if(nextLink == null){
            scrapeCategoriesPage2(inputUrl);
            decrementRequests();
            return;
        }
        scrapeCategoriesPage2(siteUrl + nextLink[1]);
        decrementRequests();
    });
}

function scrapeCategoriesPage2(inputUrl){
    incrementRequests();
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;

        $ = cheerio.load(body);
        $('.refineStyleCatalog li').each(function(index){
            var nextLink = siteUrl + $(this).find('a').attr('href');
            var ind = nextLink.indexOf('?');
            if(ind != -1){
                nextLink = nextLink.substring(0, ind);
            }
            console.log("\t" + nextLink);
            scrapeSingleCategoryPage(nextLink, 1);
        });

        decrementRequests();
    });
}

/***
This function handles the page where full product listings actually show up
This function:
1. Follows the link to each product on the page
2. Kicks off another call to the next 20 elements in the category (via the pageNum GET parameter)
   **If the call links to an empty page, we've finished crawling this category**
 */
function scrapeSingleCategoryPage(inputUrl, count){
    incrementRequests();
    urlPagination = inputUrl + "?pageNum=" + count;
    request(urlPagination, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

        var selector = $('.innerBox .productSection1');

        if(selector.length == 0){
            console.log("DOES DIS EVER HAPPEN");
            decrementRequests();
            return;
        }

        selector.each(function(index){
            var nextLink = siteUrl + $(this).find('a').attr('href');
            console.log("Product: " + nextLink);
            productQueue.push(nextLink);
        });

        scrapeSingleCategoryPage(inputUrl, count+1);

        decrementRequests();
    });

}

function sendProductRequest(productUrl, cb) {
    request(productUrl, function (err, resp, body) {
        if (err)
            throw err;

        $ = cheerio.load(body);
        var a = $('#prodPricePanel .priceTable form table tr td.col2').text();
        var name = $('.prodName').text().replace("\r", "").replace("\n", "");
        var patt = /\$\d+.\d+/;
        var imageUrl = siteUrl + $('.productImage img').attr('src');
        var lastaccess = Date(Date.now()).toString();


        var res = a.match(patt);
        if (res == null){
            console.log ("PRICE NOT FOUND: " + productUrl);
            cb("Price Not Found" + productUrl, null);
            decrementRequests();
            return;
        }
        var res = {
                    name: name,
                    price: res[0],
                    imageurl: imageUrl,
                    scraperParams: {
                        site: SCRAPER_SITE,
                        lastAccess: lastaccess
                    }
                  };
        cb(null, res);
    });
}

//for synchronously sending a batch of product requests
function getProductPage(productUrl, callback) {
    sendProductRequest(productUrl, function(err, res){
        if(err){
            console.log(err);
        }
        else
            globalResultArr.push(res);
    });
    callback();
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

exports.scrapeAll = function (next){
    sendInitialRequest(siteUrl);
    waitTillDone(function() {sendSyncedProductRequest(next);});
}

exports.updateSingleProduct = updateSingleProduct;
