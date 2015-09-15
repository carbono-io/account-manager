'use strict';

module.exports = function (app) {

    var project = app.controllers.project;
    app.post('/projects', project.create);
    app.get('/projects/:safeName', project.retrieve);
    app.put('/projects/:safeName', project.update);
    app.delete('/projects/:safeName', project.delete);

    return this;
};
