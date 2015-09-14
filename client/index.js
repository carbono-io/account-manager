'use strict';
var bodyParser = require('body-parser');
var ProfileUser = require('./app/lib/ProfileUser');
var request = require('request');
var app = {};
app['bodyParser'] = bodyParser;
app['request'] = request;

var profileUser = new ProfileUser(app);
profileUser.createUser({
    code : 'aa112ssss233',
    name: 'Joao SOlve',
    email: 'emailssssAlgum@email.com',
    password: 'passssssss'
});

profileUser.getProfile({
    code : 'aa112ssss233',
});

profileUser.login({
    email: 'emailssssAlgum@email.com',
    password: 'passssssss'
});

profileUser.userInfo({
    email: 'emailssssAlgum@email.com',
});
