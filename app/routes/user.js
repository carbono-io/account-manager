'use strict';

module.exports = function (app) {

    var user = app.controllers.user;
    app.post('/login', user.login);
    app.post('/userInfo', user.getUserInfo);

    return this;
};
