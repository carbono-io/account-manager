'use strict';

var q = require('q');

/**
 * Class that handles Projects
 *
 * @class
 */
var app = null;
var accessLevel = null;
var Project = function (paramApp) {
    app = paramApp;
};

/**
 * Method that creates a new project and assigns it to a profile
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.name - The name of the project
 * @param {string} data.safeName - The safeName of the project
 * @param {string} data.owner - The owner of the project
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.newProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.name.length > 255) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param name must have max length of 255',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    if (data.safeName.length > 80) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param safeName must have max length of 80',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    if (data.owner.length > 40) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param owner must have max length of 40',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    var AccessLevel = app.get('models').AccessLevel;
    AccessLevel
        .findOne({
            where: {name: 'dev'}
        })
        .then(function (access) {
            if (access != null) {
                // Got level
                accessLevel = access;
            } else {
                var AccessLevel = app.get('models').AccessLevel;
                AccessLevel
                    .build({
                        name: 'dev',
                    })
                    .save()
                    .then(function (newAccess) {
                        // Got access level
                        accessLevel = newAccess;
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'access_level',
                        };
                        deffered.reject(returnMessage);
                    });
            }
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'access_level',
            };
            deffered.reject(returnMessage);
        });

    var Profile = app.get('models').Profile;
    Profile
        .findOne({
            where: {code: data.owner},
        })
        .then(function (profile) {
            if (profile !== null) {
                var Project = app.get('models').Project;
                 Project
                    .build({
                        name: data.name,
                        safeName: data.safeName,
                        owner: profile.id,
                    })
                    .save()
                    .then(function (project) {
                        if (project !== null) {
                            var ProjectAccess = app.get('models').ProjectAccess;
                            ProjectAccess
                            .build({
                                profile_id: project.owner,
                                project_id: project.id,
                                access_type: accessLevel.id
                            })
                            .save()
                            .then(function (accessProj) {
                                if (accessProj !== null) {
                                    // Accept
                                    var returnMessage = {
                                        success: true,
                                    };
                                    deffered.resolve(returnMessage);
                                } else {
                                    returnMessage = {
                                        success: false,
                                        error: 'Could not set project access',
                                        table: 'project_access',
                                    };
                                    deffered.reject(returnMessage);
                                }
                            })
                            .catch(function (error) {
                                var returnMessage = {
                                    success: false,
                                    error: error,
                                    table: 'project_access',
                                };
                                deffered.reject(returnMessage);
                            });
                            
                        } else {
                            var returnMessage = {
                                success: false,
                                error: 'Could not create project',
                                table: 'project',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    });
            } else {
                var returnMessage = {
                    success: false,
                    error: 'Could not find owner',
                    table: 'profile',
                };
                deffered.reject(returnMessage);
            }
        })
        .catch(function (error) {
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
 * Method that retrieves information from a project
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.safeName - The safeName of the project
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {string} returnMessage.safeNamed - The safeName of the project
 * @returns {string} returnMessage.name - The name of the project
 * @returns {string} returnMessage.owner - The email of the project
 * @returns {string} returnMessage.developmentContainerId - The password 
 * of the project
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.getProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.safeName.length > 80) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param safeName must have max length of 80',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    
    var Project = app.get('models').Project;
    Project
        .findOne({
            where: {safeName: data.safeName},
        })
        .then(function (project) {
            if (project !== null) {
                var returnMessage = {
                    success: true,
                    safeName: project.safeName,
                    owner: project.owner,
                    name: project.name,
                    developmentContainerId: 11111,
                };
                deffered.resolve(returnMessage);
            } else {
                // 404
                returnMessage = {
                    success: false,
                    error: 'Could not find project',
                    table: 'project',
                };
                deffered.reject(returnMessage);
            }
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'project',
            };
            deffered.reject(returnMessage);
        });
    return deffered.promise;
};

/**
 * Method updates an existing project
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.safeName - The safeName of the project
 * @param {string} data.name - The name of the project
 * @param {string} data.decription - The description of the project
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.updateProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.safeName.length > 80) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param safeName must have max length of 80',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    if (data.name && data.name.length > 255) {
        returnMessage = {
            success: false,
            length: true,
            error: {
                message: 'Param name must have max length of 255',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    var Project = app.get('models').Project;
    Project
        .findOne({
            where: {safeName: data.safeName},
        })
        .then(function (project) {
            if (project !== null) {
                // If name and description
                if (data.name && data.description) {
                    project
                    .updateAttributes({
                        name: data.name,
                        description: data.description,
                    })
                    .then(function (updatedProj) {
                        if (updatedProj !== null) {
                            var returnMessage = {
                                success: true,
                            };
                            deffered.resolve(returnMessage);
                        } else {
                            returnMessage = {
                                success: false,
                                error: 'Could not update project',
                                table: 'project',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    });
                } else if (data.name) {
                    // If name
                    project
                    .updateAttributes({
                        name: data.name,
                    })
                    .then(function (updatedProj) {
                        if (updatedProj !== null) {
                            var returnMessage = {
                                success: true,
                            };
                            deffered.resolve(returnMessage);
                        } else {
                            returnMessage = {
                                success: false,
                                error: 'Could not update project',
                                table: 'project',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    });
                } else if (data.description) {
                    // If description
                    project
                    .updateAttributes({
                        description: data.description,
                    })
                    .then(function (updatedProj) {
                        if (updatedProj !== null) {
                            var returnMessage = {
                                success: true,
                            };
                            deffered.resolve(returnMessage);
                        } else {
                            returnMessage = {
                                success: false,
                                error: 'Could not update project',
                                table: 'project',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    });
                } else {
                     returnMessage = {
                        success: false,
                        error: 'You must specify at least a name or a ' +
                        'description',
                        table: 'project',
                    };
                    deffered.reject(returnMessage);
                }
            } else {
                // 404
                returnMessage = {
                    success: false,
                    notFound: true,
                    error: 'Could not find project',
                    table: 'project',
                };
                deffered.reject(returnMessage);
            }
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'project',
            };
            deffered.reject(returnMessage);
        });
    return deffered.promise;
};


module.exports = Project;
