var cheerio = require('cheerio');
var request = require('request');
var async   = require('async');


var childProcess = require('child_process');
var phantomjs    = require('phantomjs');
var exePath      = phantomjs.path;
var path         = require('path');



var homepage   = 'http://www.target.com';
var initialUrl = 'http://www.target.com/c/beauty/-/N-55r1x#?lnk=ct_menu_08_23&intc=1865095|null';


var categories     = [];
var searchViews    = [];
var productPages   = [];
var productObjects = [];

var requestsInProcess  = 0;
var maxRequestsAllowed = 10;
var minProductRequestNumber   = 2;



// for debug
var debug_items_found     = 0;
var debug_items_processed = 0;
var debug_items_claimed   = 0;


function debug(num, msg){
	console.log('DEBUG_'+num+': '+msg);
}


function requestHtml_to(parser, url){
	requestsInProcess++;
	request({url: url, timeout:50000}, function(err,resp,body){
		if(err) {
			throw err;
			return;
		}
		requestsInProcess--;
		parser(body);
	});
}


function renderHtml_to(parser, url, clicks){
	requestsInProcess++;
	var childArgs = [path.join(__dirname, 'render_html.js'), url];
	if (clicks!=undefined) childArgs.push(clicks.join(';'));
	childProcess.execFile(exePath, childArgs, {maxBuffer:1024*1024}, function(err, stdout, stderr){
		requestsInProcess--;
		parser(stdout);
	});
}




function getCategory(body){
	$ = cheerio.load(body);
	$('.leftNavShopLinks').first().next().find('a').each(function(){
		category_url = homepage + $(this).attr('href').replace(/\s/g,'');
		categories.push(category_url);
		//debug('# get_Category #', category_url);
	});

}

function getSearchView(body){
	$ = cheerio.load(body);
	$('#categoryList').find('a').each(function(){
		searchView_url = homepage + $(this).attr('href');
		searchViews.push(searchView_url);
		//debug('#6', searchView_url);
	});
}

function getProductPage(body){
	$ = cheerio.load(body);
	$('.pricecontainer').next().each(function(){
		if(!$(this).hasClass('productClick productTitle')) return; 
		product_url = homepage + $(this).attr('href');
		if(product_url.match(/_\d+_\d+$/)==null) return;
		productPages.push(product_url);

		debug_items_found++;
		//debug('#7', product_url);
	});

	if($('li.next').find('a').length==0) return;
	nxtPage_url = homepage + $('li.next').find('a').attr('href');
	//debug('#12',nxtPage_url);
	searchViews.push(nxtPage_url);

}

function getProductDetail(body){
	debug_items_processed++;
	$ = cheerio.load(body);	
	var product = {};	
	

	var currentTime = Date(Date.now()).toString();
	
	
	// case of single product. 
	// e.g. http://www.target.com/p/dove-white-beauty-bar-4-oz-8-bar/-/A-11080557#prodSlot=_1_1
	product['name']         = $('h2').children('span.fn').text().replace(/(^\s+)|(\s+$)/g,'');
	product['price']        = $('p.price').children('.offerPrice').text();
	product['overview']     = $('div.details-copy').children('p').text().replace(/(^\s+)|(\s+$)/g,'');
	product['imageurl']     = $('#heroZoomImage').find('img').attr('src');
	product['producturl']   = $('link').first().attr('href');
	product['ingredients']  = $('.ingradienttitle').next().text();
	product['scraperParams']= { site: homepage, lastAccess: currentTime }
	//product['vendor']       = 'Target';
	//product['info_table']   = $('ul.normal-list').text().replace(/[\r\n\t]/g,'').replace(/\s+/g, ' ');
	
	if(product['name']!=''){
		if(product['price'].match(/ee store/gi)!=null){
			product['price'] = '$0.00';
		}
		productObjects.push(product);
		return;
	}
	

	// case of collection product. 
	// e.g. http://www.target.com/p/dove-beauty-bar-collection/-/A-16529212#prodSlot=medium_1_1&term=dove+bar+collection
	product['name']         = $('h2.collection-name').text().replace(/(^\s+)|(\s+$)/g,'');
	product['price']        = $('p.price').find('span.pricelist').text().replace(/(^\s+)|(\s+$)/g,'');
	product['overview']     = $('div.collection-desc').text();
	product['imageurl']     = $('#heroImageBundle').find('img').attr('src');
	product['producturl']   = $('link').first().attr('href');
	product['ingredients']  = '';
	product['scraperParams']= { site: homepage, lastAccess: currentTime }
	
	// TODO: sometimes, father will lose output from the child process :(
	/*if(product.name==''){                             	
		console.log(body);
		console.log('##########$$$$$$$$$$$$')         
		require('fs').writeFile('aaabbb.html', body);
	}*/
	if(product['name']!=''){
		if(product['price'].match(/ee store/gi)!=null){
			product['price'] = '$0.00';
		}
		productObjects.push(product);
		return;
	}
}



//================ Rountine Helpers ==================

function nothing_to_scrape(){
	return categories.length==0 &&
		   searchViews.length==0 &&
		   productPages.length==0;
}

function canAddNewRequest(){
	return requestsInProcess < maxRequestsAllowed;
}

function canRequestNewProducts(){
	return maxRequestsAllowed - requestsInProcess > minProductRequestNumber;
}

function notEnoughProducts(){
	return productPages.length < maxRequestsAllowed;
}


//=================== Main Routine ====================

function initial_request(){
	requestHtml_to(getCategory, initialUrl);
}

function sendMultipleRequsts_to_getProductDetail(){
	var maxNewRequestsAllowed = maxRequestsAllowed - requestsInProcess;
	var endIdx = Math.min(productPages.length, maxNewRequestsAllowed);
	var productPages_copy = productPages.slice(0,endIdx);
	var org_length = productPages.length;
	productPages = productPages.slice(endIdx);
	debug_items_claimed += productPages_copy.length;

	debug('# new_products_requested #', productPages_copy.length);

	async.eachLimit(productPages_copy,
			        maxRequestsAllowed - requestsInProcess,
					function(prd, callback){
						renderHtml_to(getProductDetail, prd, ['#item-nutrition-link']);
						callback(null);
					},
					function(err){
						if(err) throw err;
					});
	/*async.mapLimit(productPages_copy, 
			        maxRequestsAllowed - requestsInProcess,
					function(prd, callback){
						var product = renderHtml_to(getProductDetail, prd);
						callback(null, product);
					}, 
					function(err, products){
						if(err) debug('ERR', err);
						console.log(products);
						productObjects.concat(products);
					});*/
}

function scrap_all(productNumBtwCB, CB){
	debug('# requests_in_process    #',  requestsInProcess );
	debug('# categories > searchViews > productPages     #  ', 
			categories.length  + ' > ' + 
			searchViews.length + ' > ' + 
			productPages.length);
	debug('# items_found > in_list > claimed > processed #  ',
			debug_items_found   + ' > ' +
			productPages.length + ' > ' +
			debug_items_claimed + ' > ' +
			debug_items_processed);


	if(nothing_to_scrape()){
		if (requestsInProcess==0){
			try{
				CB (null, productObjects);
			}catch(err){
				debug('CALLBACK_ERR', err);
			}
			console.log("All Target Products Information is Updated !!!");
		}else{
			setTimeout(function(){scrap_all(productNumBtwCB,CB);}, 2000);
		}
	}else{

		if(canRequestNewProducts() && productPages.length>0){
			sendMultipleRequsts_to_getProductDetail();
		}
		if(canAddNewRequest() && categories.length>0){
			var ctg = categories.shift();
			requestHtml_to(getSearchView, ctg);
		}
		if(canAddNewRequest() && notEnoughProducts() && searchViews.length>0){
			var shv = searchViews.shift();
			renderHtml_to(getProductPage, shv);
		}
		if(productObjects.length >= productNumBtwCB){
			//debug('productObjects',productObjects);
			var prdObjects = productObjects.slice(0, productNumBtwCB);
			productObjects = productObjects.slice(productNumBtwCB);
			try{
				CB (null, prdObjects);
			}catch(err){
				debug('CALLBACK_ERR', err);
			}


		}
		setTimeout(function(){scrap_all(productNumBtwCB,CB);}, 2000);
	}
}

function update_product(product_url){
	return renderHtml_to(getProductDetail, product_url, ['#item-nutrition-link']);
}


// ================== External Interface ===================

exports.scrapeAll = function(cbSize, cb){
	initial_request();
	scrap_all(cbSize, cb);
}


exports.updateSingleProduct = function(product_url, cb){
	cb(null, update_product(product_url));
}






// =============== Ignore!!! for local run ================

// main routine local test

//initial_request();
//scrap_all(5, function(err, obj){console.log('########!!!!'); console.log(obj)});



// routine tests

//requestHtml_to(getCategory, initialUrl);
//requestHtml_to(getSearchView, 'http://www.target.com/c/bath-body-beauty/-/N-5xu1m#?lnk=lnav_shopcategories_1');
//renderHtml_to(getProductPage, 'http://www.target.com/c/bar-soap-bath-body-beauty/-/N-5xu1l#?lnk=lnav_shop categories_1&intc=1709509|null');
//renderHtml_to(getProductDetail, 'http://www.target.com/p/irish-spring-original-bar-soap-3-75oz-12-pack/-/A-14280514',['#item-nutrition-link']);


