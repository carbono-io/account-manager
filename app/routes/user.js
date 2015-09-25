'use strict';

module.exports = function (app) {

    var user = app.controllers.user;
    app.post('/login', user.login);
    app.get('/users', user.userInfo);

    return this;
};
