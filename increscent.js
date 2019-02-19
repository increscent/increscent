/*
 * Robert Williams
 * Copyright 2014
 */

// require app libraries
var express = require('express');
var fs = require('fs');
var http = require('http');
/*var https = require('https');

// load in ssl files
var privateKey  = fs.readFileSync('./increscent/ssl/increscent.key', 'utf8');
var certificate = fs.readFileSync('./increscent/ssl/increscent.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};*/

// load in server files
var ui = require('./ui/ui.js');

// setup web app
var app = express();
app.use('/', express.static(__dirname + '/www/'));
app.use('/', express.static(__dirname + '/global/'));
app.use(express.json());
app.use(express.urlencoded());

// mandelbrot (pull from github)
app.use('/mandelbrot', express.static(__dirname + '/../mandelbrot/'));
app.get('/mandelbrot', function(req, res) {
    res.redirect('/mandelbrot/mandelbrot.html');
});

// initialize app
ui.init_pages();

// main site
//app.get('/', function(req, res) {
//    ui.load_page(res, 'robert');
//});
// John's math
app.get('/math', function(req, res) {
    ui.load_page(res, 'math');
});
// stocks
app.get('/stocks', function(req, res) {
    ui.load_page(res, 'stocks');
});
ping_hosts = {};
// ping
app.get('/ping/:hostname', function(req, res) {
    res.send(ping_hosts[req.params.hostname]);
});
app.post('/ping/:hostname', function(req, res) {
    ping_hosts[req.params.hostname] = req.headers['x-forwarded-for']; 
    res.send();
});

// ********** stocks ********** //
app.post('/stock/*', function(req, res) {
    var symbol = req.url.replace('/stock/', '');
    var url = 'http://www.marketwatch.com/investing/stock/' + symbol;
    http.get(url, function (response) {
        response.on('data', function (body) {
            var body_string = body.toString();
            if (body_string.indexOf('<p class="data bgLast">') !== -1) {
                res.send(body.toString().match('<p class="data bgLast">(.*?)<\/p>')[1]);
            }
        });
    });
});

// ********** app ********** //

// empty cached pages
app.get('/refresh', function(req, res) {
    ui.empty_page_cache();
    res.send('Page cache has been emptied');
});

// setup port
var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

httpServer.listen(8236);
//httpsServer.listen(443);
