/* This script is used to render the html for Ajax involved websites
 * it takes the url of the website (required)
 * and perform some clicks on elements (optional)
 * to get the full html of the website
 *
 * the output is the website html
 * which will be received in father process's stdout 
 * that calls this routine
 */


var system = require('system');
var args = system.args;
if (args.length==1) {
	cosole.error("More Argument is Expected.");
}
var request_url  = args[1];
var click_events = args.length>2?args[2].split(';'):[];


function mouseClick( element ) {
	if(element==null) return;
	var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
	element.dispatchEvent( event );
}

function click_and_render(clickEvents){
	if(clickEvents.length>0){
		var current_click = clickEvents.shift();
		debug(current_click);
		
		// perform click operations on the webpage
		page.evaluate(function(mouseClick_fn, click_slct){
			var element = document.querySelector(click_slct);
			mouseClick_fn(element);
		}, mouseClick, current_click
		);
		
		setTimeout(function(){
			click_and_render(clickEvents);
		}, 5000);
	}else{
		console.log(page.content);
		phantom.exit();
	}
}

function debug(content){
	require('fs').write( 'log.txt', content, 'a');
}

var page = require('webpage').create();
page.settings.loadImages = false;
page.settings.resourceTimeout = 20000;
page.open(request_url, function(status) {
	if(status=='fail') debug("#### Failure ####\r\n" + request_url);
	click_and_render(click_events);
});
