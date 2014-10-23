/*
 * Robert Williams
 * Copyright 2014
 */

// require app libraries
var express = require('express');
var fs = require('fs');
var nodemailer = require('nodemailer');

var app = express();
app.use(express.bodyParser());

// nodemailer
var transport = nodemailer.createTransport();

// set static directory
app.use("/", express.static(__dirname + '/global/'));

// ********** main ********** //
// home
app.post('/', function(req, res) {
	var to = req.body.to;
	var subject = req.body.subject;
	var attendee = req.body.attendee;
	var response = req.body.response;
	var redirect = req.body.redirect;
	
	var text = attendee + " " + response + " be attending the wedding.";
	
	var email = {
		from: to, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: text // plaintext body
	};
	
	transport.sendMail(email, function(error, response){
		if(error) {
		} else {
		}
	});
	
	res.writeHead(302, {
		'Location': redirect
	});
	res.end();
});

// ********** app ********** //

// setup port
app.listen(8235);