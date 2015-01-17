// global variables
var time, answer, count = 0;

$(document).ready(function () {
	init_time();
	init_controls();
	new_problem();
});

function init_controls() {
    $('#range-low').change(function () {
        $('#range-low-value').html($('#range-low').val());
    });
    $('#range-high').change(function () {
        $('#range-high-value').html($('#range-high').val());
    });
    $('#check').on('click', function() {
    	check_answer();
    });
    $('#answer').bind('enterKey',function(e){
    	check_answer();
	});
	$('#answer').keyup(function(e){
		if(e.keyCode == 13) {
			$(this).trigger('enterKey');
		}
	});
}

function init_time() {
	time = (new Date()).getTime();
	setInterval( function () {
		var current_time = (new Date()).getTime() - time;
		var seconds = Math.floor(current_time / 1000);
		var minutes = Math.floor(seconds/60);
		seconds -= minutes * 60;
		if (seconds < 10) seconds = '0' + seconds;
		if (minutes < 10) minutes = '0' + minutes;
		$('#clock').html(minutes + ':' + seconds);
		},
		100);
}

function check_answer() {
	var user_answer = parseInt($('#answer').val());
	$('#answer').focus();
	if (user_answer === answer) {
		count++;
		$('#count').html(count);
		$('#feedback').removeClass('incorrect');
		$('#feedback').addClass('correct');
		$('#feedback').html('Right on. That\'s correct!');
		new_problem();
	} else {
		$('#feedback').removeClass('correct');
		$('#feedback').addClass('incorrect');
		$('#feedback').html('Sorry, that\'s incorrect. Please try again.');
	}
}

function new_problem() {
	$('#answer').val('');
	
    var range_low = parseInt($('#range-low').val());
    var range_high = parseInt($('#range-high').val());
    var operator = $('#operator').val();
    
    if (operator === 'both') {
        if (Math.random() < 0.5) {
            operator = 'x';
        } else {
            operator = '/';
        }
    }
    
    var num1 = Math.floor((Math.random() * (range_high - range_low + 1))) + range_low;
    var num2 = Math.floor((Math.random() * (range_high - range_low + 1))) + range_low;
    answer = num1 * num2;
    
    if (operator === '/') {
        answer = num1;
        num1 *= num2;
    }
    
    $('#question').html(num1 + ' ' + operator + ' ' + num2);
}