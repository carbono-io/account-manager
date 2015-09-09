'use strict';
var bodyParser = require('body-parser');
var consign   = require('consign');
var express   = require('express');
var app       = express();

app.set('models', require('./app/models'));
app.use(bodyParser.json());

consign({cwd: 'app'})
    .include('lib')
    .include('controllers')
    .include('routes')
    .into(app, app.get('models'));

var server = app.listen(7888, function () {
    var host = '127.0.0.1';
    var port = '7888';
    console.log('Imperial listening at http://%s:%s', host, port);
});

module.exports = server;
