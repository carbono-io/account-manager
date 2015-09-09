'use strict';

var CJM = require('carbono-json-messages');
var uuid = require('node-uuid');


/**
 * Helper for handling requests.
 *
 * @class
 */
var RequestHelper = function () {
};

/**
 * Checks if the received message is compatible with the API's defined
 * structure.
 *
 * @param {Object} message - Express object representing a Request
 * @return {boolean} True if the structure is correct. False otherwise.
 *
 * @function
 */
RequestHelper.prototype.checkMessageStructure = function (message) {
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
RequestHelper.prototype.checkRequiredData = function (data, required) {
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
 * @param {string=|Object=} message - If htmlCode is 200, this param will
 * be the detail to be appended inside 'items[]' array. If it's another
 * htmlCode, it will use the error template, and this param will be included
 * at 'message' attribute.
 *
 * @function
 */
RequestHelper.prototype.createResponse = function (res, htmlCode, message) {
    res.status(htmlCode);

    if (message) {
        var cjm = new CJM({apiVersion: '1.0'});
        if (htmlCode === 200) {
            var data = {
                id: uuid.v4(),
                items: [{
                        profile: {
                            name: message.name,
                            email: message.email,
                            password: message.password,
                            code: message.code
                        }
                    }]
            }
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

module.exports = RequestHelper;
