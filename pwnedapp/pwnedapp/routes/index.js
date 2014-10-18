// Initialize ALL routes including subfolders
// NO ROUTES HERE. Just sets up the other files
// Fun Metaprogramming hack so we can just include the directory at the top level
var fs = require('fs');

module.exports = function (app, passport) {
    //hacky way to break up routing
    fs.readdirSync(__dirname).forEach(function (file) {
        if (file == "index.js") return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, passport);
    });
};