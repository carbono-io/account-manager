'use strict';

module.exports = function (app) {

    var profile = app.controllers.profile;
    app.post('/profiles', profile.create);
    app.get('/profiles/:code', profile.retrieve);

    return this;
};
