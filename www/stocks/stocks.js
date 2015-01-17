// global variables
var stocks = {};
var price_count = 3;

/*
 * function ajax_request
 * This function sends a request to the server at the given url with the given query
 * and returns the server's response
 */
function ajax_request(url, query, callback) {
	$.ajax({
		url : url,
		type: 'POST',
		data : query,
		success: function(data) {
			return callback(data);
		}
	});
}

/*
 * function update_stock
 * This function querys the server for the stock price and updates the list of prices appropriately
 */
function update_stock(symbol) {
	ajax_request('/stock/' + symbol, '', function (data) {
		if (data !== stocks[symbol].prices[0]) {
			for (var i = 1; i < price_count; i++) {
				stocks[symbol].prices[price_count - i] = stocks[symbol].prices[price_count - i - 1];
				$('.' + symbol).find('.price-' + (price_count - i)).html('$' + stocks[symbol].prices[price_count - i]);
			}
			stocks[symbol].prices[0] = data;
			$('.' + symbol).find('.price-0').html('$' + stocks[symbol].prices[0]);
		}
	});
}

/*
 * function add_stock
 * This function adds the specified stock to the list of monitored stocks
 */
function add_stock(symbol) {
	var element = '<div class="stock row ' + symbol + '" symbol="' + symbol + '">';
	element += '<div class="stock-symbol col-xs-3 col-md-2">' + symbol.toUpperCase() + '</div>';
	for (var i = 1; i < price_count + 1; i++) {
		element += '<div class="stock-price price-' + (price_count - i) + ' col-xs-3 col-md-2"></div>';
	}
	element += '</div>';
	$('#stocks').append(element);
	
	stocks[symbol] = {};
	stocks[symbol].prices = new Array(price_count);
	
	setInterval(function () {
		update_stock(symbol);
	}, 1000);
}

$(document).ready( function () {
	$('#symbol').on('keypress', function(e) {
        if (e.keyCode == 13) {
            add_stock($('#symbol').val());
			$('#symbol').val('');
        }
	});
	$('#symbol-submit').on('click', function () {
		add_stock($('#symbol').val());
		$('#symbol').val('');
	});
});