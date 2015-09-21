'use strict';

module.exports = function (app) {

    var project = app.controllers.project;
    app.post('/projects', project.create);
    app.get('/projects', project.list);
    app.get('/projects/:code', project.get);
    app.put('/projects/:code', project.update);
    app.delete('/projects/:code', project.delete);

    return this;
};
