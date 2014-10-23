// global variables
var index = [];

window.document.title = 'scriptures';

window.onbeforeunload = function () {
	return 'You are about to leave the scriptures app.';
};

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
 * function save_book
 * This function saves the given book in the localStorage
 */
function save_book(work, data) {
	data.timestamp = (new Date()).getTime();
	var error = true;
	while (error) {
		try {
			localStorage[work + ',' + data._id] = JSON.stringify(data);
			error = false;
		} catch(e) {
			error = true;
			var lowest_timestamp = (new Date()).getTime();
			var lowest_timestamp_key;
			var i = 0;
			// catch rogue loop
			while (i < 200) {
				var key = localStorage.key(i);
				if (!key) break;
				var timestamp = JSON.parse(localStorage[key]);
				if (timestamp && timestamp < lowest_timestamp) {
					lowest_timestamp = timestamp;
					lowest_timestamp_key = key;
				}
			}
			$('#index').append(JSON.parse(localStorage[localStorage.key(lowest_timestamp_key)]).timestamp + '*</br>');
			localStorage.removeItem(localStorage.key(lowest_timestamp_key));
		}
	}
}

/*
 * function get_book
 * This function returns the specified book from localStorage
 */
function get_book(work, book) {
	var result = localStorage[work + ',' + book];
	if (typeof result === 'undefined') result = false;
	return JSON.parse(result);
}

/*
 * function save_work
 * This function saves the given work in localStorage by book
 */
function save_work(data, work) {
	for (var i = 1; i < data.length; i++) {
		save_book(work, data[i]);
	}
}

/*
 * function load_work
 * This function loads the specified work from the server and saves it
 */
function load_work(work) {
	ajax_request('/scriptures/works/' + work, '', function (data) {
		save_work(data, work);
	});
}

/*
 * function load_book
 * This function loads the specified book from the server and saves it
 */
function load_book(work, book) {
	if (!get_book(work, book)) {
		ajax_request('/scriptures/books/' + work + '/' + book, '', function (data) {
			save_book(work, data);
		});
	}
}

/*
 * function get_chapter
 * This function returns the specified chapter, from the server if necessary
 */
function get_chapter(work, book, chapter, callback) {
	var saved_book = get_book(work, book);
	if (!saved_book) {
		ajax_request('/scriptures/chapters/' + work + '/' + book + '/' + chapter, '', function (data) {
			return callback(data);
		});
	} else {
		return callback(saved_book.chapters[chapter]);
	}
}

/*
 * function load_all_works
 * This function loads all the books and works from the server and saves them in localStorage
 */
function load_all_works() {
	for (var i = 0; i < index.length; i++) {
		load_work(i);
	}
}

/*
 * function init_chapter
 * This function shows the target chapter
 */
function init_chapter(target) {
	get_chapter(target[0], target[1], target[2], function (chapter) {
		var element = '';
		element += '<div class="title scripture-text">' + index[target[0]].books[target[1]].name + ' ' + (parseInt(target[2]) + 1) + '</div>';
		element += '<div class="summary">' + chapter.summary + '</div>';
		for (var i = 0; i < chapter.verses.length; i++) {
			element += '<div class="verse scripture-text" verse="' + i + '">';
			element += '<span class="verse-number">' + (i + 1) + '</span>';
			element += chapter.verses[i];
			element += '</div>';
		}
		
		var parent = $('.current').append(element);
		
		var verse = parent.find('div[verse="' + target[3] + '"]');
		if (verse.offset()) select_verse(verse, true);
		
		$('.scripture-text').unbind();
		$('.scripture-text').on('click', function () {
			select_verse($(this));
		});
	});
}

/*
 * function select_verse
 * This function selects the specified verse and shows the controls associated with it
 */
function select_verse(element, no_controls) {
	deselect();
	element.addClass('selected');
	// if verse is out of view
	if ($(window).scrollTop() > element.offset().top - $('#nav-top').outerHeight())
		$(window).scrollTop(element.offset().top - $(window).height()/4);
	if ($(window).scrollTop() < element.offset().top - $(window).height() + $('#nav-bottom').outerHeight() + element.height())
		$(window).scrollTop(element.offset().top - $(window).height()/4);
	
	if (no_controls) return;
	
	var target = $('.current').attr('target');
	if (element.hasClass('verse'))  target += ',' + element.attr('verse');
	var bookmarked = (get_bookmark() === target)? ' control-set' : '';
	
	var verse_controls = '<div class="verse-controls">';
	verse_controls += '<div class="verse-control highlight"><span class="glyphicon glyphicon-pencil"></span></div>';
	verse_controls += '<div class="verse-control bookmark' + bookmarked + '"><span class="glyphicon glyphicon-bookmark"></span></div>';
	verse_controls += '<div class="verse-control close-controls"><span class="glyphicon glyphicon-remove"></span></div>';
	verse_controls += '</div>';
	var controls = element.prepend(verse_controls);
	element.unbind();
	
	$('.verse-control').unbind();
	$('.verse-control').on('click', function () {
		if ($(this).hasClass('close-controls')) {
			deselect();
		} else if ($(this).hasClass('bookmark')) {
			set_bookmark(target);
			$(this).addClass('control-set');
		}
	});
}

/*
 * function deselect
 * This function deselects the selected verse
 */
function deselect() {
	var selected = $('.selected');
	selected.removeClass('selected');
	$('.verse-controls').remove();
	setTimeout(function () {
		selected.on('click', function () {
			select_verse($(this));
		});
	}, 500);
}

/*
 * function set_bookmark
 * This function sets the user bookmark to the specified target
 */
function set_bookmark(target) {
	localStorage.bookmark = target;
}

/*
 * function get_bookmark
 * This function returns the user bookmark
 */
function get_bookmark() {
	return localStorage.bookmark;
}

/*
 * function init_plate
 * This function creates a new plate and sets it as the current plate
 */
function init_plate(target) {
	$('.current').removeClass('current');
	
	var target_string = stringify_target(target.slice(0, 3));
	var element = '<div class="plate current" target="' + target_string + '">';
	element += '</div>';
	
	$('#plates').append(element);
}

/*
 * function init_links
 * This function produces a list based on the target
 */
function init_links(target) {
	var list = [];
	var list_type = '';
	switch (target.length) {
		default:
		case 0:
			list = index;
			list_type = 'works';
			break;
		case 1:
			list = index[target[0]].books;
			list_type = 'books';
			break;
	}
	
	var target_string = stringify_target(target);
	if (target_string !== '') target_string += ',';
	
	$('#index').find('#' + list_type).empty();
	for (var i = 0; i < list.length; i++) {
		var new_target = target_string + ((list[i]) ? list[i]._id : i);
		var element = '<div class="' + list_type + '-link link" target="' + new_target + '">';
		element += list[i].name;
		element += '</div>';
		$('#index').find('#' + list_type).append(element);
	}
	
	$('.' + list_type + '-link').unbind();
	$('.' + list_type + '-link').on('click', function (e) {
		e.stopPropagation();
		parse_target($(this).attr('target'));
	});
}

/*
 * function update_nav
 * This function uses the target to update the nav bar
 */
function update_nav(target) {
	$('#nav-top').css({top: 0});
	$('#nav-bottom').css({bottom: 0});
	
	var spacer = '&#8226;';
	var length = (target.length <= 3)? target.length : 3;
	var names = [];
	names[0] = (target[0])? index[target[0]].name : '';
	names[1] = (target[1])? index[target[0]].books[target[1]].name : '';
	names[2] = (target[2])? (parseInt(target[2], 10) + 1) : '';
	
	var nav_top = '<div class="nav-link" target=""><span class="glyphicon glyphicon-home"></span></div>';
	for (var i = 0; i < length; i++) {
		var target_string = stringify_target(target.slice(0, i + 1));
		nav_top += spacer + '<div class="nav-link" target="' + target_string + '">' + names[i] + '</div>';
	}
	
	
	var left_hidden = ' hide';
	var right_hidden = ' hide';
	var left_target = '';
	var right_target = '';
	if (target.length > 2) {
		left_hidden = '';
		right_hidden = '';
		var books = index[target[0]].books.length;
		var book = parseInt(target[1], 10);
		var chapters = parseInt(index[target[0]].books[target[1]].chapters, 10);
		var chapter = parseInt(target[2], 10);
		var new_target = [];
		new_target[0] = target[0];
		
		// left button
		if (chapter === 0) {
			if (book === 0) {
				left_hidden = ' hide';
			} else {
				new_target[1] = book - 1;
				var new_chapters = parseInt(index[target[0]].books[new_target[1]].chapters, 10);
				new_target[2] = new_chapters - 1;
				left_target = stringify_target(new_target);
			}
		} else {
			new_target[1] = book;
			new_target[2] = chapter - 1;
			left_target = left_target = stringify_target(new_target);
		}
		
		// right button
		if (chapter === chapters - 1) {
			if (book === books - 1) {
				right_hidden = ' hide';
			} else {
				new_target[1] = book + 1;
				new_target[2] = 0;
				right_target = stringify_target(new_target);
			}
		} else {
			new_target[1] = book;
			new_target[2] = chapter + 1;
			right_target = stringify_target(new_target);
		}
	}
	var nav_bottom = '<div class="nav-link prev-button' + left_hidden + '" target="' + left_target + '"><span class="glyphicon glyphicon-chevron-left"></span></div>';
	nav_bottom += '<div class="nav-link" target="' + get_bookmark() + '"><span class="glyphicon glyphicon-bookmark"></span></div>';
	nav_bottom += '<div class="nav-link next-button' + right_hidden + '" target="' + right_target + '"><span class="glyphicon glyphicon-chevron-right"></span></div>';
	
	$('#nav-top').html(nav_top);
	$('#nav-bottom').html(nav_bottom);
	$('.nav-link').unbind();
	$('.nav-link').on('click', function() {
		parse_target($(this).attr('target'));
	});
}

/*
 * fuction stringify_target
 * This function converts the target array into a string
 */
function stringify_target(target) {
    var target_string = target.toString();
    return target_string;
}

/*
 * function parse_target
 * This function interprets the target link and displays the appropriate content to the user
 */
function parse_target(target) {
	var target_array = [];
	var index;
	var i = 0;
	while ((index = target.indexOf(',')) !== -1) {
		target_array[i] = target.substring(0, index);
		target = target.substring(index + 1);
		i++;
	}
	if (target !== '') target_array[i] = target;
	
	update_nav(target_array);
	
	switch (target_array.length) {
		case 0:
			init_links(target);
			show_index('works');
			break;
		case 1:
			init_links(target);
			show_index('books');
			break;
		case 2:
			numpad($('#chapters'), target_array);
			show_index('chapters');
			load_book(target_array[0], target_array[1]);
			break;
		case 3:
		case 4:
        	init_plate(target_array);
			init_chapter(target_array);
			load_book(target_array[0], target_array[1]);
			break;
	}
}

/*
 * function show_index
 * This function shows the specified list in the index
 */
function show_index(list) {
	$('.current').removeClass('current');
	$('#index').addClass('current');
	$('#index').children().css({display: 'none'});
	$('#index').find('#' + list).css({display: 'block'});
}

/*
 * function load_index
 * This function obains the book structure from the server
 */
function load_index(callback) {
	if (localStorage.index) {
		index = JSON.parse(localStorage.index);
		return callback();
	} else {
		ajax_request('/scriptures/index', '', function (data) {
			index = data;
			localStorage.index = JSON.stringify(index);
			return callback();
		});
	}
}

// pre-ready
load_index( function () {
	//load_all_works();
	parse_target('');
});

// post-ready
$(document).ready( function () {
   	$(window).scrollTop(0);
	scroll_listener();
});

/*
 * function scroll_listener
 * This function determines whether the user is scrolling up or down and acts accordingly
 * The purpose of this function is to hide the controls when the user scrolls down and show them when the user scrolls up
 */
function scroll_listener() {
	var last_scroll_top = 0;
	var scroll_count = 0;
	var prev_scroll_count = scroll_count;
	var scroll_threshold = 5;
	$(window).scroll(function(event){
		prev_scroll_count = scroll_count;
		var scroll_top = $(this).scrollTop();
		
		if (scroll_top < last_scroll_top) {
			scroll_count += (scroll_count < scroll_threshold)? 1:0;
		} else if (scroll_top > last_scroll_top) {
			scroll_count -= (scroll_count > -scroll_threshold)? 1:0;
		}
		last_scroll_top = scroll_top;
		
		// scroll up, top of page, or bottom of page
		if ((scroll_count == scroll_threshold && scroll_count !== prev_scroll_count) || (scroll_top === 0) || (scroll_top >= $(document).height() - $(window).height() - scroll_threshold)){
			hide_nav(false);
		} else
		// scroll down
		if (scroll_count == -scroll_threshold && scroll_count !== prev_scroll_count) {
			hide_nav(true);
		}
	});
}

/*
 * function hide_verse_numbers
 * This function hides or shows the verse numbers
 */
function hide_verse_numbers(hide, current_plate) {
	if (hide) {
		current_plate.find('.verse-number').addClass('hide');
	} else {
		current_plate.find('.verse-number').removeClass('hide');
	}
}

/*
 * function hide_nav
 * This function hides or shows the nav bar
 */
function hide_nav(hide) {
	if ($('#index').hasClass('current')) return;
	
	if (hide) {
		var height = $('.nav-bar').outerHeight();
		$('#nav-top').stop().animate({top: '-' + height + 'px'}, 250);
		$('#nav-bottom').stop().animate({bottom: '-' + height + 'px'}, 250);
	} else {
		$('#nav-top').stop().animate({top: '0px'}, 250);
		$('#nav-bottom').stop().animate({bottom: '0px'}, 250);
	}
}

/*
 * function numpad
 * This function adds listener capability to the specified number pad
 */
function numpad(parent, target) {
	parent.find('.numpad').remove();
	
    var element = '<div class="numpad">';
    
    // clear button
    element += '<div class="numpad-control numpad-clear"><span class="glyphicon glyphicon-remove text-danger"></span></div>';
    
    // show number of chapters
    var chapters = index[target[0]].books[target[1]].chapters;
    var chapters_phrase = (chapters === 1)? 'chapter':'chapters';
    if (parseInt(target[0], 10) === 3)
        chapters_phrase = 'sections';
    element += '<div class="numpad-display" value="">(' + chapters + ' ' + chapters_phrase + ')</div>';
    
    // submit button
    element += '<div class="numpad-control numpad-submit"><span class="glyphicon glyphicon-ok text-success"></span></div>';
    
    var limit = (chapters >= 9)? 10 : chapters + 1; 
    for (var i = 1; i < limit; i++) {
        element += '<div class="link numpad-control numpad-number" number="' + i + '">' + i + '</div>';
    }
    element += (chapters >= 10)? '<div class="link numpad-control numpad-number" number="0">0</div>' : '';
    element += '</div>';
    var numpad_element = parent.append(element);
    
    numpad_element.find('.numpad-control').unbind();
    numpad_element.find('.numpad-control').on('click', function () {
        var value = numpad_element.find('.numpad-display').attr('value');
        var target_string = stringify_target(target);
        
        if ($(this).hasClass('numpad-number')) {
            var num = $(this).attr('number').toString();
            if (parseInt(value + num, 10) <= chapters) {
                value += num;
            } else {
                return;
            }
            if ((parseInt(value, 10) * 10) > chapters) {
				parse_target(target_string + ',' + (parseInt(value, 10) - 1));
                return;
            }
                
        } else if ($(this).hasClass('numpad-clear')) {
        	if (value.length === 0) {
        		return;
        	}
        	value = '';
        } else if ($(this).hasClass('numpad-submit')) {
        	if (value.length > 0) {
				parse_target(target_string + ',' + (parseInt(value, 10) - 1));
        	}
			return;
        }
        
        numpad_element.find('.numpad-display').attr('value', value);
        numpad_element.find('.numpad-display').html(value);
    });
}

/*
 * function slide_up
 * This function uses the DOM to slide the element up the desired amount
 */
function slide_up(dom_element, amount, increment) {
	if (amount > 0) {
		var old_top = parseInt(dom_element.style.top.replace('px', ''));
		dom_element.style.top = (old_top - increment) + 'px';
		setTimeout(function () {
			slide_up(dom_element, amount - Math.abs(increment), increment);
		}, 5);
	}
}


// credits
// nautilus mobile