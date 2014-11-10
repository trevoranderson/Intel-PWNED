var mongoClient = require('mongodb').MongoClient;
mongoClient.connect('mongodb://localhost:27017/TestDB', function(err, db){
	if (err) throw err;
	console.log('successfully connected to server.')
	var products = db.collection('products');

	var prd = {};// = {name:'iphone', price:'1999'};
	prd['name'] = 'testPhone';
	prd['price'] = '991';
	prd['description'] = 'sdfsfsfsf';
	products.insert(prd,function(err,result){});
	db.close();
});









