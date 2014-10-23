// load in modules
var fs = require('fs');
// global variables
var header = "";
var footer = "";
var pages = {};

/*
 * function init_pages
 * This function loads in the site pages initially so that they can be accessed easily when necessary
 */
function init_pages() {
	fs.readFile('./increscent/www/main/header.html', function(err, data) {
		header = data.toString();
	});
	fs.readFile('./increscent/www/main/footer.html', function(err, data) {
		footer = data.toString();
	});
}

/*
 * function load_page
 * This function retrieves the header and footer templates and inserts the specified content into them
 */
function load_page(res, page) {
	//check if page has already been loaded
	if (pages[page]) {
		res.send(header + pages[page] + footer);
	} else {
		fs.readFile('./increscent/www/' + page + '/' + page + '.html', function(err, data) {
			if (err) {
				load_error_page(res);
				return;
			}
			
			pages[page] = data.toString();
			res.send(header + pages[page] + footer);
		});
	}
}

/*
 * function load_error_page
 * This function is called when there is a ui error and returns an error page to the user
 */
function load_error_page(res) {
	res.send("Sorry, an error occurred. Please try again later");
}

/*
 * function empty_page_cache
 * This function resets all loaded page data to update it
 */
function empty_page_cache() {
	init_pages();
	pages = {};
}

module.exports.init_pages = init_pages;
module.exports.load_page = load_page;
module.exports.load_error_page = load_error_page;
module.exports.empty_page_cache = empty_page_cache;