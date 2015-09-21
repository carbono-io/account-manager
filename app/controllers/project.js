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
     * @param {string} req.headers.crbemail - The owner of the project
     * @param {string} req.name - The name of the project
     * @param {string} req.description - The description of the project
     * @param {Object} res - Response object
     *
     * curl -X POST localhost:7888/account-manager/projects/ -d
     * '{"apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id":
     * "1234", "items": [{"name": "Projeto 3",  "description": "Descricao"}]}}'
     * --verbose -H "Content-Type: application/json" -H "crbemail:
     * connor.john@resistance.com"
     */
    this.create = function (req, res) {
        if (req.headers.crbemail) {
            if (reqHelper.checkMessageStructure(req)) {
                var userData = req.body.data.items[0];
                userData.owner = req.headers.crbemail;
                var missingProperties =
                    reqHelper.checkRequiredData(
                        userData, ['owner', 'name', 'description']);
    
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
                            function (result) {
                                var data = {
                                    id: uuid.v4(),
                                    items: [
                                        {
                                            project: {
                                                code: result.code,
                                                safeName: result.safeName,
                                                name: result.name,
                                                description: result.description,
                                            },
                                        },
                                    ],
                                };
                                reqHelper.createResponse(res, 201, data);
                            },
                            function (err) {
                                reqHelper.createResponse(res, err.code,
                                    [err.table, err.error].join(' - '));
                            }
                        );
                    } catch (e) {
                        console.log(e)
                        reqHelper.createResponse(res, 500, e);
                    }
                }
            } else {
                reqHelper.createResponse(res, 400, 'Malformed request');
            }
        } else {
            reqHelper.createResponse(res, 400,
                'Malformed request - Header attribute cbrEmail not found!');
        }
        
    };
    
    /**
     * Returns all projects from a user
     *
     * @param {Object} req - Request object
     * @param {string} req.headers.crbemail - The owner of the project
     * @param {string} req.params.code - The code of the project
     * @param {Object} res - Response object
     *
     * curl localhost:7888/account-manager/projects/ --verbose
     * -H "crbemail: connor.john@resistance.com"
     */
    this.list = function (req, res) {
        if (req.headers.crbemail) {
            var userData = {};
            userData.email = req.headers.crbemail;
            try {
                project.getProjects(userData).then(
                    function (result) {
                        var data = {
                            id: uuid.v4(),
                            items: result
                        };
                        reqHelper.createResponse(res, 200, data);
                    },
                    function (err) {
                        reqHelper.createResponse(res, err.code,
                        [err.table, err.error].join(' - '));
                    }
                );
            } catch (e) {
                console.log(e)
                reqHelper.createResponse(res, 500, e);
            }
        } else {
            reqHelper.createResponse(res, 400,
                'Malformed request - Header attribute cbrEmail not found!');
        }
    };

    /**
     * Returns info from an existing project
     *
     * @param {Object} req - Request object
     * @param {string} req.headers.crbemail - The owner of the project
     * @param {string} req.params.code - The code of the project
     * @param {Object} res - Response object
     *
     * curl localhost:7888/account-manager/projects/
     * a47ce6e8-3c77-4933-a036-09b748d23832 --verbose
     * -H "crbemail: connor.john@resistance.com"
     */
    this.get = function (req, res) {
        if (req.params && req.params.code && req.headers.crbemail) {
            var userData = { 
                code: req.params.code,
                email: req.headers.crbemail,
            };
            try {
                project.getProject(userData).then(
                    function (result) {
                        var data = {
                            id: uuid.v4(),
                            items: [
                                {
                                    project: {
                                        code: result.code,
                                        safeName: result.safeName,
                                        name: result.name,
                                        description: result.description,
                                    },
                                },
                            ],
                        };
                        reqHelper.createResponse(res, 200, data);
                    },
                    function (err) {
                        reqHelper.createResponse(res, err.code,
                        [err.table, err.error].join(' - '));
                    }
                );
            } catch (e) {
                reqHelper.createResponse(res, 500, e);
            }
        } else {
            reqHelper.createResponse(res, 400,
            'Malformed request - Missing cbrEmail or code');
        }
    };

    /**
     * Updates an project user based on a code
     *
     * @param {Object} req - Request object
     * @param {string} req.headers.crbemail - The email of the owner
     * @param {string} req.params.code - The code of the project
     * @param {string} req.name - Name of the project
     * @param {string} req.description - Description of the project
     * @param {Object} res - Response object
     *
     * curl -X PUT localhost:7888/account-manager/projects/
     * 6e16be44-bade-4653-80b3-5a74affaa9e9 -d '{"apiVersion":"1.0",
     * "id":"23123-123123123-12312", "data":{"id": "1234", "items": [{"name":
     * "Projeto alterado",  "description": "Descricao alterada tambem"}]}}'
     * --verbose -H "Content-Type: application/json" -H "crbemail:
     * connor.john@resistance.com"
     */
    this.update = function (req, res) {
        if (req.params && req.params.code && req.headers.crbemail &&
            reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            
            userData.code = req.params.code;
            userData.email = req.headers.crbemail;
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['name', 'description']);
            if (missingProperties.length) {
                var errMessage = '';
                missingProperties.forEach(function (prop) {
                    errMessage += 'Malformed request: ' + prop +
                     ' is required.\n';
                });
                reqHelper.createResponse(res, 400, errMessage);
            } else {
                try {
                    project.updateProject(userData).then(
                        function (result) {
                            var data = {
                                id: uuid.v4(),
                                items: [
                                    {
                                        project: {
                                            code: result.code,
                                            safeName: result.safeName,
                                            name: result.name,
                                            description: result.description,
                                        },
                                    },
                                ],
                            };
                            reqHelper.createResponse(res, 201, data);
                        },
                        function (err) {
                            reqHelper.createResponse(res, err.code,
                            [err.table, err.error].join(' - '));
                        }
                    );
                } catch (e) {
                    reqHelper.createResponse(res, 500, e);
                }
            }
        } else {
            reqHelper.createResponse(res, 400,
            'Malformed request - Missing email or code');
        }
    };

    /**
     * Deletes a project
     *
     * @param {Object} req - Request object
     * @param {string} req.headers.crbemail - The email of the owner
     * @param {string} req.params.code - The code of the project
     * @param {Object} res - Response object
     *
     * curl example: curl -X DELETE
     * curl -X DELETE localhost:7888/account-manager/projects/
     * 6e16be44-bade-4653-80b3-5a74affaa9e9 --verbose -H
     * "crbemail: connor.john@resistance.com"
     */
    this.delete = function (req, res) {
        if (req.params && req.params.code && req.headers.crbemail) {
            var userData =
            { 
                code: req.params.code,
                email: req.headers.crbemail,
            };
            try {
                project.deleteProject(userData).then(
                    function (result) {
                        var data = {
                            id: uuid.v4(),
                            items: [
                                {
                                    project: {
                                        code: result.code,
                                        safeName: result.safeName,
                                        name: result.name,
                                        description: result.description,
                                    },
                                },
                            ],
                        };
                        reqHelper.createResponse(res, 200, data);
                    },
                    function (err) {
                        reqHelper.createResponse(res, err.code,
                        [err.table, err.error].join(' - '));
                    }
                );
            } catch (e) {
                reqHelper.createResponse(res, 500, e);
            }
        } else {
            reqHelper.createResponse(res, 400,
            'Malformed request - Missing cbrEmail or code');
        }
    };

    return this;
};
