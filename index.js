'use strict';
var consign    = require('consign');
var bodyParser = require('body-parser');
var express    = require('express');
var app        = express();
var models = require('./app/models');

app.use(bodyParser.json());

consign({cwd: 'app'})
    .include('controllers')
    .include('routes')
    .into(app, models);

var server = app.listen(7888, function () {
    var host = '127.0.0.1';
    var port = '7888';
    console.log('Imperial listening at http://%s:%s', host, port);
});

module.exports = server;
