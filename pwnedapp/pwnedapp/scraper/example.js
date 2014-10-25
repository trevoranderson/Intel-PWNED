var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.cvs.com/shop/vitamins/herbals/cinnamon/nature-s-bounty-high-potency-cinnamon-plus-chromium-capsules-2000-mg-skuid-740533'
request(url, function(err, resp, body){
	if (err)
		throw err;
	$ = cheerio.load(body);
	var a = $('#prodPricePanel .priceTable form table tr td.col2').text();
	var patt = /\$\d+.\d+/;
	var res = a.match(patt);
	console.log(res[0]);
});

