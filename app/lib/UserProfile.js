'use strict';

var q = require('q');

/**
 * Class that handles user profile
 *
 * @class
 */
var app = null;
var UserProfile = function (paramApp) {
    app = paramApp;
};

/**
 * Creates a new Account and persists the information
 * This will create a new profile and usermane for the use in the
 * relational database
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.name - The name of the user
 * @param {string} data.email - The email of the user
 * @param {string} data.password - The password of the user
 * @param {string} data.code - The code of the user
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
UserProfile.prototype.newAccount = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.name.length > 200) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param name must have max length of 200',
            },
            table: 'profile',
        };
        deffered.reject(returnMessage);
    }

    if (data.email.length > 200) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param email must have max length of 200',
            },
            table: 'user',
        };
        deffered.reject(returnMessage);
    }

    if (data.password.length > 60) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param password must have max length of 60',
            },
            table: 'user',
        };
        deffered.reject(returnMessage);
    }

    if (data.code.length > 40) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param code must have max length of 40',
            },
            table: 'profile',
        };
        deffered.reject(returnMessage);
    }

    var User = app.get('models').User;

    User
        .build({
            email: data.email,
            password: data.password,
        })
        .save()
        .then(function (user) {

            var Profile = app.get('models').Profile;
            Profile.build({
                firstName: data.name,
                lastName: '',
                code: data.code,
            })
            .save()
            .then(function (profile) {

                profile.addUsers(user).then(function () {

                    var returnMessage = {
                        success: true,
                    };
                    deffered.resolve(returnMessage);
                })
                .catch(function (error) {
                    var returnMessage = {
                        success: false,
                        error: error,
                        table: 'profile_user',
                    };
                    deffered.reject(returnMessage);
                });
            })
            .catch(function (error) {
                var returnMessage = {
                    success: false,
                    error: error,
                    table: 'profile',
                };
                deffered.reject(returnMessage);
            });
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'user',
            };
            deffered.reject(returnMessage);
        });
    return deffered.promise;
};

/**
 * Retrieves the user account from the database
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.code - The code of the user
 *
 * @returns {Object} returnMessage - The return object
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {string} returnMessage.id - The id of the profile
 * @returns {string} returnMessage.name - The name of the user
 * @returns {string} returnMessage.email - The email of the user
 * @returns {string} returnMessage.password - The password of the user
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 */
UserProfile.prototype.getUserAccount = function (data) {
    var deffered = q.defer();

    // Validation
    if (data.code.length > 40) {
        var returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param code must have max length of 40',
            },
            table: 'profile',
        };
        deffered.reject(returnMessage);
    }

    var Profile = app.get('models').Profile;
    Profile
    .findOne({
        where: {code: data.code},
    })
    .then(function (profile) {
        profile.getUsers()
        .then(function (ret) {
            var returnMessage = {
                success: true,
                code: profile.get().code,
                name: profile.get().firstName,
                email: ret[0].dataValues.email,
                password: ret[0].dataValues.password,
            };
            deffered.resolve(returnMessage);
        }).catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'user',
            };
            deffered.reject(returnMessage);
        });

    }).catch(function (error) {
        var returnMessage = {
            success: false,
            error: error,
            table: 'profile',
        };
        deffered.reject(returnMessage);
    });
    return deffered.promise;
};

module.exports = UserProfile;
