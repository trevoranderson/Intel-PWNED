var mongoose = require('mongoose');

// define the schema for our user model
var productSchema = mongoose.Schema({
    name: String,
    price: Number,
    imageurl: String,
    producturl: String,
    overview: String,
    ingredients: [String],
    scraperParams: {
        site: String,
        lastAccess: Date,
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Product', productSchema);