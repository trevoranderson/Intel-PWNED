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

var SCRAPER_SITE = "Walmart";
var siteUrl = 'http://www.walmart.com/cp/1085666';
var TIME_BETWEEN_REQUESTS = 1000;
var timeout_count = 0;

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

/**
 * Give an inputURL it extracts the categories from that page and visits each of them.
 * Currently only consists of Beauty and Personal Care
 *
 * @param inputUrl URL containing the category list
 */
function sendInitialRequest(inputUrl){
    incrementRequests();
    console.log("numberOfRequests " + numberOfRequests);
    request(inputUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        console.log("Scraping categories:");
        $('.lhn-menu-flyout-1col a').each(function(index){
         //   if(index>4)
          //      return;
          //this website has some ugly category which will cause nuberofrequest cant be 0
          //so if the url does not have browse, it means it direct to another main category which
          //is not a single category
            if($(this).attr('href').match("browse")==null)
                return;
            var nextLink = 'http://www.walmart.com'+$(this).attr('href');
            console.log("\t" + nextLink);
            scrapeSingleCategoryPage(nextLink, 1);
        });
        decrementRequests();
        console.log("numberOfRequests " + numberOfRequests);
    });
}

/**
 * Give a category url it will proceed to grab all the product urls and add them to a queue.
 * It will start scraping from the page parameter (set page=1 for to get all pages).
 * All product urls will be placed in a queue and WILL NOT be visited by this function.
 *
 * @param inputUrl Category URL to scrape
 * @param page Page number to scrape
 */
function scrapeSingleCategoryPage(inputUrl, page){
    incrementRequests();

    console.log("initial request " +numberOfRequests);
    var categoryPage = inputUrl + "?page=" + page;
    request(categoryPage, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

       

        //add the product URL to the queue

        var selector = $('.tile-grid-unit-wrapper');
        

        selector.each(function(index){
            var nextLink = 'http://www.walmart.com' + $(this).find('a').attr('href');
            console.log("Product: " + nextLink + "  " + categoryPage);
            productQueue.push(nextLink);
        });
        
        if($('.paginator-btn-next').length == 0){
             console.log("Finish: " + categoryPage);
            decrementRequests();
            console.log("pageend req: " + numberOfRequests);
            return;
        }
        
        scrapeSingleCategoryPage(inputUrl, page+1);

        decrementRequests();
        console.log("end req: " + numberOfRequests);
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
        timeout_count++;
        
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

//for synchronously sending a batch of product requests
function getProductPage(productUrl, callback) {
    sendProductRequest(productUrl, function(err, res){
        if(err){
            console.log(err);
        }
        else
        {
            globalResultArr.push(res);
            //console.log("Global: "+ "/t" + globalResultArr);
        }
    });
    callback();
}


function sendProductRequest(productUrl, cb) {
    request(productUrl, function (err, resp, body) {
        if (err)
            throw err;

        $ = cheerio.load(body);


        var name_long = $('.js-product-heading').text();
        var name = name_long.trim();
        var price = $('.price-display').text().trim();
        var imgUrl = $('.js-product-primary-image').attr('src');
        var lastaccess = Date(Date.now()).toString();
 
        //extract overview and ingredients
        
        //var overview = "";
        //var ingredients = "";

        var res = {
                    name: name,
                    price: price,
                    imageurl: imgUrl,
                    producturl: productUrl,
                    scraperParams: {
                        site: SCRAPER_SITE,
                        lastAccess: lastaccess
                    }
                    //overview:
                    //ingredients:
                  };
        cb(null, res);
    });
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