'use strict';

var bodyParser = require('body-parser');
var consign   = require('consign');
var express   = require('express');
var config    = require('config');
require('colors');

var app       = express();
var baseApp   = express();

app.set('models', require('./app/models'));
app.use(bodyParser.json());
app.use('/account-manager', baseApp);
baseApp.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'carbono.io');
    res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
    res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, crbemail');
    next();
});

consign({cwd: process.cwd() + '/app'})
    .include('lib')
    .include('controllers')
    .include('routes')
    .into(baseApp);

var server = app.listen(config.get('port'), function () {
    var port = config.get('port');
    var host = config.get('host');
    console.log('Imperial listening at http://%s:%s', host, port);
    require('carbono-service-manager');
});

module.exports = server;
