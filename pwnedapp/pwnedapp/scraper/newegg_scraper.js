var cheerio = require('cheerio');
var request = require('request');
var async   = require('async');

var vendor = 'NewEgg';
var catagoryUrl = {
	'Amazon': 'http://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Dmobile&field-keywords=phone&rh=n%3A2335752011%2Ck%3Aphone',
	'NewEgg': 'http://www.newegg.com/Product/ProductList.aspx?Submit=ENE&N=100006740&IsNodeId=1'
};


var contentPage  = catagoryUrl[vendor];
var productPages = [];
var i = 0;
var nxtPageBusy  = false;


// =============== Main Routine ==================
waitTillDone(function(){
	console.log('All Requests are Finished.')
});



function waitTillDone(whenDone){
	// Get Page Information, and Get Url for Next Page
	if(!nxtPageBusy && contentPage!='') {
		try{
			getProductsUrl_andGetNextPage(contentPage);
			setTimeout(function(){waitTillDone(whenDone);},5000);
		}catch(err){
			console.log('ERR: ' + err);
		}
	}else if(contentPage!=''){
		setTimeout(function(){waitTillDone(whenDone);}, 5000);
	}else{
		whenDone();
	}

	// Get Information for each product, and insert all the information into database
	if(productPages.length>0){
		var productPages_copy = productPages;
		productPages = [];
		async.mapLimit(productPages_copy, 2, visitProduct_andGetInformation, 
			function(err, objects){
				console.log(objects[0]);
				insertProductsIntoDatabase(objects);
				console.log('DB_INST: ' + objects.length + ' products inserted into database.');
			}
		);
		setTimeout(function(){waitTillDone(whenDone);},5000);
	}
}



// =============== Scraper Function ===============
function getProductsUrl_andGetNextPage(url){
	if(url=='') return;
	nxtPageBusy = true;
	request({url: url, timeout:50000}, function(err, resp, body){
		if(err) console.log(err)
		$ = cheerio.load(body);
		var nxtPageUrl = '';

		switch(vendor){
			case 'Amazon': {
				// product urls	
				$('.newaps').children('a').each(function(i, elem){
					var prdUrl = $(this).attr('href');
					productPages.push(prdUrl);
					console.log(prdUrl);
				});
				// next page 
				nxtPageUrl = $('#pagnNextLink').attr('href');console.log('#1');
				break;
			}
			
			case 'NewEgg': {
				// product urlsq1.push(5);
				$('.wrapper').children('a').each(function(i, elem){
					var prdUrl = $(this).attr('href');
					productPages.push(prdUrl);
				});
				// next page url
				if((n=url.search(/Page=\d+$/i))>0){
					var newNum = parseInt(url.substring(n+5))+1;
					nxtPageUrl = url.replace(/(\d+)$/, newNum);
				}else{
					nxtPageUrl = url+'&Page=2';
				}
				if($('a.next').parent().attr('class')=='disabled'){	
					nxtPageUrl = '';
				}
				break;
			}
		}
		//console.log('NXT_PNG: ' + nxtPageUrl);
		contentPage = nxtPageUrl;	
		nxtPageBusy = false;
	});


}

function visitProduct_andGetInformation(url, prdInfoCallback){
	request({url: url, timeout:50000}, function(err, resp, body){
		if(err) throw err
		var fs = require('fs');
		fs.writeFile('/tmp/test.txt', body, function(err){
			if(err) console.log(err);
		});	;
		$ = cheerio.load(body);

		var product={};	
		switch(vendor){
			case 'Amazon':
				product['name']        = $('#btAsinTitle').text();
				product['price']       = $('#actualPriceValue').text();
				product['vendor']      = 'Amazon';
				product['productUrl']  = url;
				// buggy!!!!
				product['description'] = $('#feature-bullets').text();
				//console.log(product);
				break;
			
			case 'NewEgg':
				// price from body rather than from html
				var priceLine = body.match(/product_sale_price:[^\]]+\]/);
				var prdPrice  = 'Unkown';
				if (priceLine!=null){
					prdPrice = priceLine[0].replace(/[^.\d]/g,'');
					if (prdPrice == '') prdPrice = 'Unknown';
				}
				//product['name']        = $('h1>span#grpDescrip_0').text().replace(/\s+$/,'');
				product['name']        = $('h1>span').first().text().replace(/\s+$/, '');
				product['price']       = prdPrice;
				product['vendor']      = 'NewEgg';
				product['productUrl']  = url;
				product['imageUrl']    = $('#A2').children('span').children('img').attr('src');
				product['description'] = $('.grpBullet').text().replace(/[\r\n\t]|(<.*>)|(\s){2,}/g, '');

				//console.log(product);
				break;
		}
		//console.log(product);
		//console.log('NEW_PRD: ' + product['name']);
		//insertProductsIntoDatabase(product);
		if(product['name']=='') console.log(product['productUrl']);
		prdInfoCallback(null, product);
	});
}


function insertProductsIntoDatabase(prds){
	var mongoClient = require('mongodb').MongoClient;
	mongoClient.connect('mongodb://localhost:27017/TestDB', function(err, db){
		if (err) console.log('DB_ERR:  ' + err);
		console.log('successfully connected to server.');
		var products = db.collection('products');
		for (var i = 0; i<prds.length; i++){
			prd = prds[0];
			console.log(prd);
			products.insert(prd,function(err,result){
				if(err) console.log('DB_IST_ERR: '+err);
				db.close();
			});
		}
	});
}


