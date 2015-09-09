'use strict';

/**
 * Controller for handling profile related requests.
 *
 * @author Carbono Team
 * @module profile
 */
module.exports = function (app, models) {

    var RequestHelper = require('../lib/RequestHelper');
    var UserProfile = require('../lib/UserProfile');
    var userProfile = new UserProfile(app);
    var reqHelper = new RequestHelper();

    /**
     * Creates a new profile.
     *
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     *
     * curl example: curl -X POST localhost:7888/profiles/ -d '{
     "apiVersion":"1.0", "id":"23123-123123123-12312", "data":{"id": "1234",
     "items": [{"code" : "12311jg3123kj", "name": "Nome",
     "email": "email@email.com", "password": "shh~"}]}}' --verbose
     -H "Content-Type: application/json"
     */
    this.create = function (req, res) {
        if (reqHelper.checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                reqHelper.checkRequiredData(
                    userData, ['code', 'name', 'email', 'password']);

            if (missingProperties.length) {
                missingProperties.forEach(function (prop) {
                    reqHelper.createResponse(res, 400,
                        'Malformed request: ' + prop + ' is required.');
                });
            } else {
                var promisseNewAccount = userProfile.newAccount(userData);
                
                promisseNewAccount
                    .then(function (data) {
                        reqHelper.createResponse(res, 200);
                    }, function (err) {
                          reqHelper.createResponse(res, 404, 'Malformed request');
                    });
                
                
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
            var code = req.params.code;
            
            var userData = {
                code: code
            };
            
            var promisseNewAccount = userProfile.getUserAccount(userData);
                
            promisseNewAccount
                .then(function (data) {
                    reqHelper.createResponse(res, 200, data);
                }, function (err) {
                      reqHelper.createResponse(res, 404, 'Malformed request');
                });

            // TODO: código do vitor aqui
            // createResponse(res, 404, 'profile not found');
            
            reqHelper.createResponse(res, 200);
        } else {
            reqHelper.createResponse(res, 400,
                'Malformed request: id is required.');
        }
    };

    return this;
};
