'use strict';
var CJM = require('carbono-json-messages');

/**
 * Checks if the received message is compatible with the API's defined
 * structure.
 *
 * @param {Object} message - Express object representing a Request
 * @return {boolean} True if the structure is correct. False otherwise.
 *
 * @function
 */
var checkMessageStructure = function (message) {
    return message &&
        message.body &&
        message.body.id &&
        message.body.apiVersion === '1.0' &&
        message.body.data &&
        message.body.data.id &&
        message.body.data.items &&
        message.body.data.items[0];
};

/**
 * Checks if the data has all the required properties.
 *
 * @param {Object} data - Object which will be checked.
 * @param {string[]} required - Required properties
 * @return {string[]} All missing properties.
 */
var checkRequiredData = function (data, required) {
    var missing = [];
    required.forEach(function (prop) {
        if (!data.hasOwnProperty(prop)) {
            missing.push(prop);
        }
    });
    return missing;
};

/**
 * Creates a response message, according to API's defined structure.
 *
 * @param {Object} res - Express object representing Response.
 * @param {number} htmlCode - HTML Code for this Response.
 * @param {string=|Object=} message - If htmlCode is 200, this param will be the
 * detail to be appended inside 'items[]' array. If it's another htmlCode, it
 * will use the error template, and this param will be included at 'message'
 * attribute.
 *
 * @function
 */
var createResponse = function (res, htmlCode, message) {
    res.status(htmlCode);

    if (message) {
        var cjm = new CJM({apiVersion: '1.0'});
        if (htmlCode === 200) {
            cjm.setData(message);
        } else {
            cjm.setError({
                code: htmlCode,
                message: message,
            });
        }
        res.json(cjm);
    }
    res.end();
};

module.exports = function (app, models) {

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
        if (checkMessageStructure(req)) {
            var userData = req.body.data.items[0];
            var missingProperties =
                checkRequiredData(
                    userData, ['code', 'name', 'email', 'password']);

            if (missingProperties.length) {
                missingProperties.forEach(function (prop) {
                    createResponse(res, 400,
                        'Malformed request: ' + prop + ' is required.');
                });
            } else {
                // TODO: código do vitor aqui

                createResponse(res, 200);
            }
        } else {
            createResponse(res, 400, 'Malformed request');
        }
    };

    /**
     * Returns an profile user based on a ID.
     */
    this.retrieve = function (req, res) {
        if (req.params && req.params.code) {
            var code = req.params.code;

            // TODO: código do vitor aqui
            // createResponse(res, 404, 'profile not found');
            createResponse(res, 200);
        } else {
            createResponse(res, 400, 'Malformed request: id is required.');
        }
    };

    return this;
};
