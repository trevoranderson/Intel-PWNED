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

var url = 'http://www.cvs.com';
var globalHash = {};
var numberOfRequests = 0;

var productQueue = [];

var sendSyncedProductRequest = function(timeBetweenRequests) {
    async.eachSeries(productQueue,
        function (url, callback) {
            getProductPage(url, function(){setTimeout(callback, timeBetweenRequests);});
        },
        function (err) {
            console.log("Finished processing products");
        });
}

// ==== Function declarations go here =====


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
            if(index != 0){return;}
            var nextLink = url + $(this).find('a').attr('href');
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
        scrapeCategoriesPage2(url + nextLink[1]);
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
        //    if(index != 0){return;}
            var nextLink = url + $(this).find('a').attr('href');
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
            var nextLink = url + $(this).find('a').attr('href');
            console.log("Product: " + nextLink);
            productQueue.push(nextLink);
        });

        scrapeSingleCategoryPage(inputUrl, count+1);

        decrementRequests();
    });

}
function getProductPage(productUrl, callback) {
    callback();
    incrementRequests();
    request(productUrl, function (err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        var a = $('#prodPricePanel .priceTable form table tr td.col2').text();
        var name = $('.prodName').text();
        var patt = /\$\d+.\d+/;
        var res = a.match(patt);
        if (res == null){
            console.log ("PRICE NOT FOUND: " + productUrl);
            decrementRequests();
            return;
        }
        globalHash[name] = {"price": res[0]};
        console.log(name + ": " + globalHash[name]["price"]);
        decrementRequests();
    });
}

/*
var sendSyncedProductRequest2 = function(timeBtwnRequests){
    productQueue.each(function(url){
            getProductPage(url);
            setTimeout(, timeBetweenRequests);
        });
}*/

exports.scrape_cvs = function (timeBetweenRequests){
    sendInitialRequest(url);
    waitTillDone(function() {sendSyncedProductRequest(timeBetweenRequests)});
}
