'use strict';

var q = require('q');
var bcrypt = require('bcrypt-nodejs');

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
 * Hash and salt pristine pass word
 *
 * @function
 * @param {string} pwd - Pass word
 * @param {Object} callback - Object containing necessary data
 * @param {Object} callback.params.err - Error object
 * @param {string} callback.params.hash - Salted and hashed pass word
 */
var hash = function(pwd, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(pwd, salt, null, function (err, hash) {
            if (err) return callback(err);
            callback(null, hash);
        });
    });
};

/**
 * Compare salted hash to pristine string
 *
 * @function
 * @param {string} pwd - Pass word
 * @param {string} hashedPwd - Salted hash string
 * @param {Object} callback - Object containing necessary data
 * @param {Object} callback.params.err - Error object
 * @param {boolean} callback.params.isMatch - True if pwd match to hashedPwd
 */
var hashCompare = function(pwd, hashedPwd, callback) {
    bcrypt.compare(pwd, hashedPwd, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
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

    hash(data.password, function (err, hash){
       if(!err){
           data.password = hash;
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
       } else {
            returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Password security failed',
            },
            table: 'user',
        };
        deffered.reject(returnMessage);
        }
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
 * @returns {string} returnMessage.password - The salted and hashed pass word
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

/**
 * Checks if there is a user with the sent username
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.email - The email of the user
 *
 * @returns {Object} returnMessage - The return object
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {string} returnMessage.id - The id of the profile
 * @returns {string} returnMessage.name - The name of the user
 * @returns {string} returnMessage.email - The email of the user
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 */
UserProfile.prototype.getUserByEmail = function (data) {
    var deffered = q.defer();

    // Validation
    if (data.email.length > 200) {
        var returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param email must have max length of 40',
            },
            table: 'user',
        };
        deffered.reject(returnMessage);
    }
    var User = app.get('models').User;
    User
    .findOne({
        where: {email: data.email},
    })
    .then(function (user) {
        user.getProfiles()
        .then(function (profile) {
            var returnMessage = {
                success: true,
                code: profile[0].dataValues.code,
                name: profile[0].dataValues.firstName,
                email: data.email,
            };
            deffered.resolve(returnMessage);
        }).catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'profile',
            };
            deffered.reject(returnMessage);
        });
    }).catch(function (error) {
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
 * Checks if exists a user with email and password
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.email - The email of the user
 * @param {string} data.password - The password of the user
 *
 * @returns {Object} returnMessage - The return object
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 */
UserProfile.prototype.validatePassword = function (data) {
    var deffered = q.defer();

    // Validation
    if (data.email.length > 200) {
        var returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param email must have max length of 40',
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
    var User = app.get('models').User;
    User
    .findOne({
        where: {email: data.email},
    })
    .then(function (user) {
        if (user !== null) {
            var returnMessage = {};
            hashCompare(data.password, user.password, function (err, isMatch){
                if(!err && isMatch){
                    data.password = hash;
                    returnMessage = {
                        success: true,
                    };
                    deffered.resolve(returnMessage);
                } else {
                    returnMessage = {
                        success: false,
                        error: 'Password does not match',
                        table: 'user',
                    };
                    deffered.reject(returnMessage);
                }
            });
        } else {
            returnMessage = {
                success: false,
                error: 'User not found',
                table: 'user',
            };
            deffered.reject(returnMessage);
        }

    }).catch(function (error) {
        var returnMessage = {
            success: false,
            error: error,
            table: 'user',
        };
        deffered.reject(returnMessage);
    });
    return deffered.promise;
};

module.exports = UserProfile;