'use strict';

/**
 * Controller for handling project related requests.
 *
 * @author Carbono Team
 * @module project
 */
module.exports = function (app) {
    var RequestHelper = require('../lib/RequestHelper');
    var Project   = require('../lib/Project');
    var uuid          = require('node-uuid');

    var reqHelper = new RequestHelper();
    var project = new Project(app);

    /**
     * Creates a new project.
     *
     * @param {Object} req - Request object
     * @param {string} req.owner - The owner of the project
     * @param {string} req.name - The name of the project
     * @param {string} req.safeName - The safeName of the project
     * @param {Object} res - Response object
     *
     * curl -X POST localhost:7888/account-manager/projects/ -d
     * '{"apiVersion":"1.0", "id":"23123-123123123-12312",
     * "data":{"id": "1234", "items": [{"owner" : "12311jg3123kj",
     * "name": "Projeto Teste", "safeName": "projeto-teste"}]}}'
     * --verbose -H "Content-Type: application/json"
     */
    this.create = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['owner', 'name', 'safeName']);

            if (missingProperties.length) {
                var errMessage = '';
                missingProperties.forEach(function (prop) {
                    errMessage += 'Malformed request: ' + prop +
                    ' is required.\n';
                });
                reqHelper.createResponse(res, 400, errMessage);
            } else {
                try {
                    project.newProject(userData).then(
                        function () {
                            reqHelper.createResponse(res, 200);
                        },
                        function (err) {
                            reqHelper.createResponse(res, 400,
                                [err.table, err.error].join(' - '));
                        }
                    );
                } catch (e) {
                    reqHelper.createResponse(res, 400, e[0]);
                }
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    /**
     * Returns info from an existing project
     *
     * @param {Object} req - Request object
     * @param {string} req.params.safeName - The namespace of the project
     * @param {Object} res - Response object
     *
     * curl example: curl localhost:7888/account-manager/projects/projeto-teste
     * --verbose
     */
    this.retrieve = function (req, res) {
        if (req.params && req.params.safeName) {
            var userData = { safeName: req.params.safeName };

            try {
                project.getProject(userData).then(
                    function (result) {
                        var data = {
                            id: uuid.v4(),
                            items: [
                                {
                                    project: {
                                        safeName: result.safeName,
                                        owner: result.owner,
                                        name: result.name,
                                        developmentContainerId:
                                        result.developmentContainerId,
                                    },
                                },
                            ],
                        };
                        reqHelper.createResponse(res, 200, data);
                    },
                    function (err) {
                        if (err.notFound) {
                            reqHelper.createResponse(res, 404,
                            [err.table, err.error].join(' - '));
                        } else {
                            reqHelper.createResponse(res, 400,
                            [err.table, err.error].join(' - '));
                        }
                    }
                );
            } catch (e) {
                reqHelper.createResponse(res, 400, e[0]);
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    /**
     * Updates an project user based on a safeName
     *
     * @param {Object} req - Request object
     * @param {Object} req.name - Name of the project
     * @param {Object} req.description - Description of the project
     * @param {Object} res - Response object
     *
     * curl -X PUT localhost:7888/account-manager/projects/projeto-teste -d
     * '{"apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id":
     * "1234", "items": [{ "name": "Mudara Nome", "description":
     * "Uma nova description"}]}}'
     * --verbose -H "Content-Type: application/json"
     */
    this.update = function (req, res) {
        if (req.params && req.params.safeName &&
            reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            userData.safeName = req.params.safeName;
            try {
                project.updateProject(userData).then(
                    function () {
                        reqHelper.createResponse(res, 200);
                    },
                    function (err) {
                        if (err.notFound) {
                            reqHelper.createResponse(res, 404,
                            [err.table, err.error].join(' - '));
                        } else {
                            reqHelper.createResponse(res, 400,
                            [err.table, err.error].join(' - '));
                        }
                    }
                );
            } catch (e) {
                reqHelper.createResponse(res, 400, e[0]);
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    /**
     * Deletes a project
     *
     * @param {Object} req - Request object
     * @param {string} req.params.safeName - The namespace of the project
     * @param {Object} res - Response object
     *
     * curl example: curl -X DELETE
     * localhost:7888/account-manager/projects/projeto-teste --verbose
     */
    this.delete = function (req, res) {
        if (req.params && req.params.safeName) {
            var userData = { safeName: req.params.safeName };
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['safeName']);

            if (missingProperties.length) {
                var errMessage = '';
                missingProperties.forEach(function (prop) {
                    errMessage += 'Malformed request: ' + prop +
                     ' is required.\n';
                });
                reqHelper.createResponse(res, 400, errMessage);
            } else {
                try {
                    project.deleteProject(userData).then(
                        function () {
                            reqHelper.createResponse(res, 200);
                        },
                        function (err) {
                            if (err.notFound) {
                                reqHelper.createResponse(res, 404,
                                [err.table, err.error].join(' - '));
                            } else {
                                reqHelper.createResponse(res, 400,
                                [err.table, err.error].join(' - '));
                            }
                        }
                    );
                } catch (e) {
                    reqHelper.createResponse(res, 400, e[0]);
                }
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    return this;
};
