/*
 * Robert Williams
 * Copyright 2014
 */

function play_pause(video) {
	if (video.paused) {
		$(video).animate({ opacity: "1" }, 150);
		video.play();
		$(video).css({cursor: 'url("/pause_cursor.png"), auto'});
	} else {
		$(video).animate({ opacity: "0.7" }, 150);
		video.pause();
		$(video).css({cursor: 'url("/play_cursor.png"), auto'});
	}
}

function update_progress(video, video_progress) {
	var width = (video.currentTime / video.duration * $('.video-box').width());
	video_progress.width(width);
}

function toggle_progress_bar() {
	$('.video-box').hover( function() {
		$(this).find('.video-progress').animate({ height: "15px" }, 250);
	}, function() {
		$(this).find('.video-progress').animate({ height: "3px" }, 250);
	});
}

$(document).ready( function() {
	var video = $('.video-box').find('.video').get(0);
	
	$('.video').on("click", function() {
		play_pause(video);
	});

	toggle_progress_bar();
	
	$('.video-bar').click(function(e) {
		var posX = $(this).offset().left, posY = $(this).offset().top;
		var percentage = (e.pageX - posX) / $('.video-box').width();
		video.currentTime = percentage * video.duration;
	});
	
	var video_progress = $('.video-box').find('.video-progress');
	setInterval(function() {update_progress(video, video_progress)}, 250);
});