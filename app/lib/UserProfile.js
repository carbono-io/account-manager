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
 * Queries the database to find a new code that is not present
 *
 * @function
 *
 * @returns {boolean} ret.success - If found or not a code
 * @returns {boolean} ret.code - The code
 * 
 */
function findCodeOnProfile () {
    var deferred = q.defer();
    var uuid = require('node-uuid');
    var newCode = uuid.v4();
    var Profile = app.get('models').Profile;

    Profile
        .findOne({
            where: {code: newCode},
        })
        .then(function (profile) {
            var ret = {};
            if (profile === null) {
                ret = {
                    success: true,
                    code: newCode,
                };
                deferred.resolve(ret);
            } else {
                ret = {
                    success: false,
                };
                deferred.resolve(ret);
            }
        })
        .catch(function (error) {
            var ret = {
                success: false,
            };
            deferred.resolve(ret);
        });
    return deferred.promise;
}

/**
 * Generates a new code that does not exists in the database for the profile
 *
 * @function
 * @param {Object} body - Function that tries to find a code that is not on
 * the database yet
 *
 * @returns {string} ret.code - A unused code for the profile
 */
function generateCode (body) {
    var deferred = q.defer();

    function loop() {

        body().then(function(bool) {
            if (bool.success) {
                // If found
                return deferred.resolve(bool);
            } else {
                // If not found yet
                return q.when(body(), loop, deferred.reject);
            }
        });
    }
    q.nextTick(loop);
    return deferred.promise;
}

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

    var User = app.get('models').User;

    User
        .build({
            email: data.email,
            password: data.password,
        })
        .save()
        .then(function (user) {
            var Profile = app.get('models').Profile;
            generateCode(findCodeOnProfile).then(
                function(res) {
                    Profile.build({
                        firstName: data.name,
                        lastName: '',
                        code: res.code,
                    })
                    .save()
                    .then(function (profile) {
                        profile.addUsers(user).then(function () {
                            var returnMessage = {
                                success: true,
                                code: res.code,
                                name: data.name,
                                email: data.email,
                            };
                            deffered.resolve(returnMessage);
                        })
                        .catch(function (error) {
                            var returnMessage = {
                                success: false,
                                code: 400,
                                error: error,
                                table: 'profile_user',
                            };
                            deffered.reject(returnMessage);
                        });
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            code: 400,
                            error: error,
                            table: 'profile',
                        };
                        deffered.reject(returnMessage);
                    });
                },
                function (err) {
                    deffered.reject(err);
                });
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                code: 400,
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
        if (profile != null) {
            profile.getUsers()
                .then(function (ret) {
                    var returnMessage = {};
                    if (ret !== null) {
                        returnMessage = {
                            success: true,
                            code: profile.get().code,
                            name: profile.get().firstName,
                            email: ret[0].dataValues.email,
                        };
                        deffered.resolve(returnMessage);
                    } else {
                        returnMessage = {
                            success: false,
                            code: 404,
                            error: 'User not found',
                            table: 'User',
                        };
                        deffered.reject(returnMessage);
                    }
                }).catch(function (error) {
                    var returnMessage = {
                        success: false,
                        code: 400,
                        error: error,
                        table: 'user',
                    };
                    deffered.reject(returnMessage);
                });
        } else {
            var returnMessage = {
                success: false,
                code: 404,
                error: 'Profile not found',
                table: 'Profile',
            };
            deffered.reject(returnMessage);
        }
    }).catch(function (error) {
        var returnMessage = {
            success: false,
            code: 400,
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
            code: 400,
            error: {
                message: 'Param email must have max length of 200',
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
            user.getProfiles()
            .then(function (profile) {
                var returnMessage = {};
                if (profile !== null) {
                    returnMessage = {
                        success: true,
                        code: profile[0].dataValues.code,
                        name: profile[0].dataValues.firstName,
                        email: data.email,
                    };
                    deffered.resolve(returnMessage);
                } else {
                    returnMessage = {
                        success: false,
                        code: 404,
                        error: 'Profile not Found',
                        table: 'profile',
                    };
                    deffered.reject(returnMessage);
                }
            }).catch(function (error) {
                var returnMessage = {
                    success: false,
                    code: 400,
                    error: error,
                    table: 'profile',
                };
                deffered.reject(returnMessage);
            });
        } else {
            var returnMessage = {
                success: false,
                code: 404,
                error: 'User not Found',
                table: 'user',
            };
            deffered.reject(returnMessage);
        }
    }).catch(function (error) {
        var returnMessage = {
            success: false,
            code: 400,
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
 * @returns {Object} returnMessage.code - The error code or the profile code
 * @returns {Object} returnMessage.email - The user email
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 */
UserProfile.prototype.validatePassword = function (data) {
    var deffered = q.defer();

    // Validation
    if (data.email.length > 200) {
        var returnMessage = {
            success: false,
            code: 400,
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
            code: 400,
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
        where: {email: data.email, password: data.password},
    })
    .then(function (user) {
        var returnMessage = {};
        if (user !== null) {
            var ProfileUser = app.get('models').ProfileUser;
            ProfileUser
            .findOne({
                where: {user_id : user.id},
            })
            .then(function (profileUser) {
                if (profileUser != null) {
                    app.get('models').Profile
                    .findOne({
                        where: {id: profileUser.profile_id},
                    })
                    .then(function (profile) {
                        if (profile != null) {
                            returnMessage = {
                                success: true,
                                code: profile.code,
                                email: user.email,
                            };
                            deffered.resolve(returnMessage);
                        } else {
                            returnMessage = {
                                success: false,
                                code: 404,
                                error: 'Profile not found',
                                table: 'profile',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            code: 400,
                            error: error,
                            table: 'profile',
                        };
                        deffered.reject(returnMessage);
                    });
                } else {
                    returnMessage = {
                        success: false,
                        code: 404,
                        error: 'ProfileUser not found',
                        table: 'profile_user',
                    };
                    deffered.reject(returnMessage);
                }
            })
            .catch(function (error) {
                var returnMessage = {
                    success: false,
                    code: 400,
                    error: error,
                    table: 'profile_user',
                };
                deffered.reject(returnMessage);
            });
            
        } else {
            returnMessage = {
                success: false,
                code: 404,
                error: 'User not found',
                table: 'user',
            };
            deffered.reject(returnMessage);
        }

    }).catch(function (error) {
        var returnMessage = {
            success: false,
            code: 400,
            error: error,
            table: 'user',
        };
        deffered.reject(returnMessage);
    });
    return deffered.promise;
};

module.exports = UserProfile;
