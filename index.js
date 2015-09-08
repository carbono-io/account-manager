'use strict';
var consign   = require('consign');
var express   = require('express');
var app       = express();
var models = require('./app/models');

consign({cwd: 'app'})
    .include('controllers')
    .include('routes')
    .into(app, models);

var server = app.listen(7888, function () {
    var host = '127.0.0.1';
    var port = '7888';
    console.log('Imperial listening at http://%s:%s', host, port);
});

// var user = models.User.create({
//     email: 'a@a.com',
//     password: 'password',
// });
//
// var profile = models.Profile.create({
//     firstName: 'aa',
//     lastName: 'bb',
// });
//
// user.addProfile(profile).then(function () {
//     console.log('associação realizada com sucesso!');
// });

module.exports = server;
