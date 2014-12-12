/* This script is used to render the html for Ajax involved websites
 * it takes the url of the website (required)
 * in this case it will consistently click on the next button to load pages
 *
 * the output is the website html
 * which will be received in father process's stdout 
 * that calls this routine
 */

//DEBUG:
//debug("Entered Phantom Script: Loreal");

//need to provide the URL to work on 
var system = require('system');
var args = system.args;
if (args.length==1) {
	console.log("\t Please provide a Loreal URL to work on.");
	exit();
}

var request_url  = args[1];
var next_selector = "div.paginator a.next";
var next_disabled_selector = "div.paginator a.next.disabled";
var productsContainer_selector = "div.wrap.products-container";
var productLink_selector = "a.ProductLink";

var page = require('webpage').create();
page.settings.loadImages = false;
page.settings.resourceTimeout = 20000;
//when you do console.log in evaluate it will redirect it to stderr
page.onConsoleMessage = function(msg) {
	if( msg.indexOf("PUSH: ") > -1 ) {
		system.stdout.writeLine(msg.substring(6));
	} else {
		system.stderr.writeLine(msg);
	}
};
page.open(
	request_url, 
	function(status) {
		if(status=='fail') {
			debug("#### Failure ####\r\n" + request_url);

			//DEBUG
			//debug("Failed to open page.")
			exit();
		} else {
			//DEBUG
			//debug("Opened page.")
			click_and_render();
		}
	}
);


//====================================
//		Function Implementation
//====================================

//will continually click the next button until it can't anymore
function click_and_render(){
	//DEBUG
	//debug("Looking for next...");

	//click the next button if it exists (0 if next found, -1 if not)
	var status = page.evaluate( function(mouseClick_fn, nd_selector, n_selector) {
		var disabled_next = document.querySelector(nd_selector);

		//if the next is not disabled then proceed to click it
		if( disabled_next == null) {
			var element = document.querySelector(n_selector);
			mouseClick_fn(element);
			return 0;
		} else {
			return -1;
		}
	}, mouseClick, next_disabled_selector, next_selector);

	if( status == -1 ) {
		//DEBUG
		//debug("EXITTING\n\n");
		exit()
	} else {
		//debug("Waiting for page to reload...");

		//wait for it to load (3 sec)
		window.setTimeout(function(){
			//output what we need from this page
			page.evaluate( function(container, link){
				var container = document.querySelector(container);
				if( container != null ) {
					var links = container.querySelectorAll(link);
					if( links != null ) {
						[].forEach.call(links, function(curr_link) {
							console.log("PUSH: " + curr_link.getAttribute("href"));
						});
					}
				}
			}, productsContainer_selector, productLink_selector);

			//go to next page
			click_and_render();
		}, 3000);
	}

	/*
	//DEBUG
	debug("Click Selector: " + next_selector);
	debug("Clicking...");

	//click Next on the webpage
	page.evaluate( function(mouseClick_fn, click_slct){
		var element = document.querySelector(click_slct);

		//DEBUG
		console.log("Element: " + element.textContent);

		mouseClick_fn(element);
	}, mouseClick, next_selector);
*/
}

function mouseClick( element ) {
	if(element==null) 
		return;

	//create mouse click event
	var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );

    //send click to element
	element.dispatchEvent( event );
}

function debug(content){
	require('fs').write( 'log.txt', content + "\n", 'a');
}

//exits phantomjs avoiding errors
//http://stackoverflow.com/questions/26608391/using-phantomjs-to-embed-all-images-of-a-webpage-produces-warnings-but-works/26688062#26688062
function exit() {
	setTimeout(function() {
		phantom.exit();
	}, 0);
}