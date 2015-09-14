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
     "items": [{"code" : "123456", "name": "Nome", "email": "email@email.com",
     "password": "shh~"}]}}' --verbose -H "Content-Type: application/json"
     */
    this.create = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['code', 'name', 'email', 'password']);

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
                        function () {
                            reqHelper.createResponse(res, 200);
                        },
                        function (err) {
                            reqHelper.createResponse(res, 400,
                                [err.table, err.error].join(' - '));
                        }
                    );
                } catch (e) {
                    reqHelper.createResponse(res, 400, e);
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
    this.retrieve = function (req, res) {
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
                                    password: result.password,
                                },
                            },
                        ],
                    };
                    reqHelper.createResponse(res, 200, data);
                },
                function (err) {
                    if (err.length) {
                        reqHelper.createResponse(res, 400, err.error.message);
                    } else {
                        reqHelper.createResponse(res, 404, 'profile not found');
                    }
                }
            );
        } else {
            reqHelper.createResponse(res, 400,
                'Malformed request: id is required.');
        }
    };

    return this;
};
