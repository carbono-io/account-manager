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
     * Verifies if the credentials are valid.
     *
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     *
     * curl -X POST localhost:3000/account-manager/login -d
     '{"apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id": "1234",
     "items": [{"email": "email@email.com", "password": "shh~"}]}}'
     --verbose -H "Content-Type: application/json"
     */
    this.login = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(userData, ['email', 'password']);

            if (missingProperties.length) {
                missingProperties.forEach(function (prop) {
                    reqHelper.createResponse(res, 400,
                        'Malformed request: ' + prop + ' is required.');
                });
            } else {
                try {
                    userProfile.validatePassword(userData).then(
                        function () {
                            reqHelper.createResponse(res, 200);
                        },
                        function (err) {
                            if (err.length) {
                                reqHelper.createResponse(res, 400,
                                [err.table, err.error].join(' - '));
                            } else {
                                reqHelper.createResponse(res, 404,
                                [err.table, err.error].join(' - '));
                            }
                        });
                } catch (e) {
                    reqHelper.createResponse(res, 400, e);
                }
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    

    /**
     * Returns all user informations that will be available at oauth.
     *
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     *
     * curl -X POST localhost:3000/account-manager/userInfo -d
    '{"apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id": "1234",
    "items": [{"email": "email@email.com"}]}}' --verbose
    -H "Content-Type: application/json"
     */
    this.getUserInfo = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            if (userData.hasOwnProperty('email')) {
                try {
                    userProfile.getUserByEmail(userData).then(
                        function (result) {
                            var data = {
                                id: uuid.v4(),
                                items: [
                                    {
                                        profile: {
                                            code: result.code,
                                            name: result.name,
                                            email: result.email,
                                            password: result.password,
                                        },
                                    },
                                ],
                            };
                            reqHelper.createResponse(res, 200, data);
                        },
                        function (err) {
                            if (err.length) {
                                reqHelper.createResponse(res, 400,
                                [err.table, err.error].join(' - '));
                            } else {
                                reqHelper.createResponse(res, 404,
                                [err.table, err.error].join(' - '));
                            }
                        }
                    );
                } catch (e) {
                    reqHelper.createResponse(res, 400, e);
                }
            } else {
                reqHelper.createResponse(res, 400,
                'Malformed request - Must have email or password');
            }
        } else {
            reqHelper.createResponse(res, 400, 'Malformed request');
        }
    };

    return this;
};
