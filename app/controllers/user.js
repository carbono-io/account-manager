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
     * curl -X POST localhost:7888/account-manager/login/ -d
     * '{"apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id":
     * "1234","items": [{"email": "connor.john@resistance.com","password":
     * "shh~"}]}}' --verbose -H "Content-Type: application/json"
     */
    this.login = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(userData, ['email', 'password']);

            if (missingProperties.length) {
                var errMessage = '';
                missingProperties.forEach(function (prop) {
                    errMessage += 'Malformed request: ' + prop +
                     ' is required.\n';

                });
                reqHelper.createResponse(res, 400, errMessage);
            } else {
                try {
                    userProfile.validatePassword(userData).then(
                        function (result) {
                            var data = {
                                id: uuid.v4(),
                                items: [
                                    {
                                        code: result.code,
                                        email: result.email,
                                    },
                                ],
                            };
                        reqHelper.createResponse(res, 200, data);
                            reqHelper.createResponse(res, 200);
                        },
                        function (err) {
                            reqHelper.createResponse(res, err.code,
                            [err.table, err.error].join(' - '));
                        });
                } catch (e) {
                    reqHelper.createResponse(res, 500, e);
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
     * @param {string} req.headers.crbemail - The email of the user
     * @param {Object} res - Response object
     *
     * curl localhost:7888/account-manager/users/
     * * -H "Content-Type: application/json"
     * -H "crbemail: connor.john@resistance.com"
     */
    this.userInfo = function (req, res) {
        if (req.headers.crbemail) {
            var userData = {
                email: req.headers.crbemail,
            };
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
                'Malformed request - Header attribute cbrEmail not found!');
        }
    };

    return this;
};
