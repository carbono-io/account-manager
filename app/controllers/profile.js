'use strict';

/**
 * Controller for handling profile related requests.
 *
 * @author Carbono Team
 * @module profile
 */
module.exports = function (app) {
    var RequestHelper = require('../lib/RequestHelper');
    var UserProfile   = require('../lib/UserProfile');
    var uuid          = require('node-uuid');

    var reqHelper = new RequestHelper();
    var userProfile = new UserProfile(app);

    /**
     * Creates a new profile.
     *
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     *
     * curl example: curl -X POST localhost:7888/profiles/ -d '{
     "apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id": "1234",
     "items": [{"name": "Nome", "email": "email@email.com",
     "password": "shh~"}]}}' --verbose -H "Content-Type: application/json"
     */
    this.create = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['name', 'email', 'password']);

            if (missingProperties.length) {
                var errMessage = '';
                missingProperties.forEach(function (prop) {
                    errMessage += 'Malformed request: ' + prop +
                     ' is required.\n';
                });
                reqHelper.createResponse(res, 400, errMessage);
            } else {
                try {
                    userProfile.newAccount(userData).then(
                        function (result) {
                            var data = {
                                id: uuid.v4(),
                                items: [
                                    {
                                        profile: {
                                            code: result.code,
                                            name: result.name,
                                            email: result.email,
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
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    /**
     * Returns an profile user based on a ID.
     *
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     *
     * curl example: curl localhost:7888/profiles/123456 --verbose
     */
    this.get = function (req, res) {
        if (req.params && req.params.code) {
            var code = { code: req.params.code };

            userProfile.getUserAccount(code).then(
                function (result) {
                    var data = {
                        id: uuid.v4(),
                        items: [
                            {
                                profile: {
                                    code: result.code,
                                    name: result.name,
                                    email: result.email,
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
        } else {
            reqHelper.createResponse(res, 400,
                'Malformed request: profile code is required.');
        }
    };

    return this;
};
