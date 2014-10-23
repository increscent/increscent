/*
 * Robert Williams
 * Copyright 2014
 */

// require app libraries
var express = require('express');
var fs = require('fs');
var app = express();

app.use("/", express.static(__dirname + '/feather/'));
app.use("/", express.static(__dirname + '/global/'));

// ********** app ********** //

// setup port
app.listen(8234);