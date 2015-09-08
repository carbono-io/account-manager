'use strict';
var bodyParser = require('body-parser');

module.exports = function (app) {

    var jsonParser = bodyParser.json();

    var persistance = app.controllers.persistance;
    app.get('/', persistance.root);
    app.post('/persistance', jsonParser, persistance.new);

    return this;
};
