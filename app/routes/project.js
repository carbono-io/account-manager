'use strict';

module.exports = function (app) {

    var project = app.controllers.project;
    app.post('/projects', project.create);
    // app.get('/projects', project.list);
    // app.get('/projects/:safeName', project.get);
    // app.put('/projects/:safeName', project.update);
    // app.delete('/projects/:safeName', project.delete);

    return this;
};
