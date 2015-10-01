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
