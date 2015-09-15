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
}).then(
    function(success) {
        console.log('\n\nCreate User');
        console.log(success)
    },
    function(error) {
        console.log('\n\nCreate User');
        console.log(error)
    }
);

profileUser.getProfile({
    code : 'aa112ssss233',
}).then(
    function(success) {
        console.log('\n\nGet User Profile');
        console.log(success)
    },
    function(error) {
        console.log('\n\nGet User Profile');
        console.log(error)
    }
);


profileUser.login({
    email: 'emailssssAlgum@email.com',
    password: 'passssssss'
}).then(
    function(success) {
        console.log('\n\n Verify user login');
        console.log(success)
    },
    function(error) {
        console.log('\n\n Verify user login');
        console.log(error)
    }
);


profileUser.userInfo({
    email: 'emailssssAlgum@email.com',
}).then(
    function(success) {
        console.log('\n\nGet User Profile');
        console.log(success)
    },
    function(error) {
        console.log('\n\nGet User Profile');
        console.log(error)
    }
);