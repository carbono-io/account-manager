'use strict';
var bodyParser = require('body-parser');
var consign   = require('consign');
var express   = require('express');
var config    = require('config');
var app       = express();

app.set('models', require('./app/models'));
app.use(bodyParser.json());

consign({cwd: 'app'})
    .include('lib')
    .include('controllers')
    .include('routes')
    .into(app);

var port = config.get('port');
var host = config.get('host');
var server = app.listen(config.get('port'), function () {
    console.log('Imperial listening at http://%s:%s', host, port);
});

module.exports = server;
