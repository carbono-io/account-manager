'use strict';

var q = require('q');
var uuid = require('node-uuid');

/**
 * Slugifies the project name
 *
 * @function
 *
 * @param {string} text - The project name
 * 
 * @returns {string} text - The slugified project name
 * 
 */
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generates a new code that is not in the database
 *
 * @function
 * @param {number} cont - A counter for the loop
 * @param {string} name - The project name
 * @param {number} owner - The owner id
 *
 * @returns {boolean} ret.success - If found or not a code
 * @returns {boolean} ret.code - The code
 * 
 */
function findUnusedCode () {
    var deferred = q.defer();
    var name =  uuid.v4();
    var Project = app.get('models').Project;

    Project
        .findOne({
            where: {
                safeName: name,
            },
        })
        .then(function (project) {
            var ret = {};
            if (project === null) {
                ret = {
                    success: true,
                    safeName: name,
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
 * Generates a new safeName that does not exists in the database
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
var app = null;

/**
 * Class that handles Projects
 *
 * @class
 */
var Project = function (paramApp) {
    app = paramApp;
};

/**
 * Method that creates a new project and assigns it to a profile
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.name - The name of the project
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
            code: 400,
            error: {
                message: 'Param name must have max length of 255',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    if (data.owner.length > 200) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param owner must have max length of 200',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }

    // Gets a accessLevel for dev or creates if not exists
    this.getWriteAccessLevel().then(
        function (accessLevel) {
            // Finds the profile that will own the project
            getProfileIdFromEmail(data.owner).then(
                function (res) {
                    data.owner = res.profileId;
                    data.code = uuid.v4();
                    app.get('models').Project
                        .build({
                            name: data.name,
                            code: data.code,
                            safeName: slugify(data.name).substr(0, 80),
                            description: data.description,
                            owner: data.owner,
                        })
                        .save()
                        .then(function (project) {
                            if (project !== null) {
                                // If the project is created
                                var ProjectAccess =
                                app.get('models').ProjectAccess;
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
                                            code: data.code,
                                            safeName: project.safeName,
                                            name: data.name,
                                            description:
                                            data.description,
                                        };
                                        deffered
                                        .resolve(returnMessage);
                                    } else {
                                        returnMessage = {
                                            success: false,
                                            code: 400,
                                            error:'Could not set' +
                                            'project access',
                                            table: 'project_access',
                                        };
                                        deffered
                                        .reject(returnMessage);
                                    }
                                })
                                .catch(function (error) {
                                    var returnMessage = {
                                        success: false,
                                        error: error,
                                        code: 400,
                                        table: 'project_access',
                                    };
                                    deffered.reject(returnMessage);
                                });
                            } else {
                                var returnMessage = {
                                    success: false,
                                    code: 400,
                                    error:
                                    'Could not create project',
                                    table: 'project',
                                };
                                deffered.reject(returnMessage);
                            }
                        })
                        .catch(function (error) {
                            // Try to generate a new safeName
                            generateCode(findUnusedCode).then(
                                function (res) {
                                    data.code = res.code;
                                    app.get('models').Project
                                    .build({
                                        name: data.name,
                                        code: data.code,
                                        safeName:
                                        slugify(data.name).substr(0, 80),
                                        description: data.description,
                                        owner: data.owner,
                                    })
                                    .save()
                                    .then(function (project) {
                                        if (project !== null) {
                                            // If the project is created
                                            var ProjectAccess =
                                            app.get('models').ProjectAccess;
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
                                                        code: data.code,
                                                        safeName:
                                                        project.safeName,
                                                        name: data.name,
                                                        description:
                                                        data.description,
                                                    };
                                                    deffered
                                                    .resolve(returnMessage);
                                                } else {
                                                    returnMessage = {
                                                        success: false,
                                                        code: 400,
                                                        error:'Could not set' +
                                                        'project access',
                                                        table: 'project_access',
                                                    };
                                                    deffered
                                                    .reject(returnMessage);
                                                }
                                            })
                                            .catch(function (error) {
                                                var returnMessage = {
                                                    success: false,
                                                    error: error,
                                                    code: 400,
                                                    table: 'project_access',
                                                };
                                                deffered.reject(returnMessage);
                                            });
                                        } else {
                                            var returnMessage = {
                                                success: false,
                                                code: 400,
                                                error:
                                                'Could not create project',
                                                table: 'project',
                                            };
                                            deffered.reject(returnMessage);
                                        }
                                    })
                                    .catch(function (error) {
                                        var returnMessage = {
                                            success: false,
                                            error: error,
                                            code: 500,
                                            table: 'project',
                                        };
                                        deffered.reject(returnMessage);
                                    });
                                },
                                function () {
                                    var returnMessage = {
                                        success: false,
                                        error: 'Could not create project',
                                        code: 500,
                                        table: 'project',
                                    };
                                    deffered.reject(returnMessage);
                                }
                            );
                        });
                },
                function (err) {
                    deffered.reject(err);
                }
            );
        },
        function (error) {
            deffered.reject(error);
        });

    return deffered.promise;
};

/**
 * Method that retrieves the AccessLevel for write
 *
 * @function
 *
 * @returns {Object} newAccess - AccessLevel instance
 * @returns {Object} returnMessage - Object with message
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.getWriteAccessLevel = function () {
    var deffered = q.defer();
    var AccessLevel = app.get('models').AccessLevel;
    AccessLevel
        .findOne({
            where: {name: 'write'}
        })
        .then(function (access) {
            if (access !== null) {
                // Got level
                deffered.resolve(access);
            } else {
                var AccessLevel = app.get('models').AccessLevel;
                AccessLevel
                    .build({
                        name: 'write',
                    })
                    .save()
                    .then(function (newAccess) {
                        // Got access level
                        if (newAccess !== null) {
                            deffered.resolve(newAccess);
                        } else {
                            var returnMessage = {
                                success: false,
                                code: 500,
                                error: 'Could not create AccessLevel',
                                table: 'access_level',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            code: 500,
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
                code: 501,
                table: 'access_level',
            };
            deffered.reject(returnMessage);
        });
    return deffered.promise;
};

/**
 * Method that lists all projects from a user
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.email - The email of the logged user
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {Array} projects - An array of projects
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.getProjects = function (data) {
    var deffered = q.defer();
    var response = [];
    if (data.email.length > 200) {
        var returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param email must have max length of 200',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    getProfileIdFromEmail(data.email).then(
        function (res) {
            app.get('models').ProjectAccess
            .findAll({
                where: {profile_id: res.profileId}
            })
            .then(function (projectAccess) {
                queryProjects(projectAccess, response, res.profileId).then(
                    function (finished) {
                        response = finished;
                        deffered.resolve(response);
                    },
                    function (error) {
                        deffered.reject(error);
                    }
                );
            })
            .catch(function (error) {
                var returnMessage = {
                    success: false,
                    code: 500,
                    error: error,
                    table: 'project',
                };
                deffered.reject(returnMessage);
            });
        },
        function (err) {
            deffered.reject(err);
        }
    );

    return deffered.promise;
};

/**
 * Method that queries the projects based on the access
 *
 * @function
 * @param {Array} projectAccess - List of projects and access
 * @param {Array} response - The response Array
 * @param {number} profile - The id of the profile
 *
 * @returns {Array} response - The response Array
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
var queryProjects = function(projectAccess, response, profile) {
    var deffered = q.defer();
    var index = 0;
    projectAccess.forEach(function (access) {
        var projectId = access.project_id;
        var access_level = access.access_type;
        app.get('models').AccessLevel
        .findOne({
            where: {id: access_level},
        })
        .then(function (accessProj) {
            if (accessProj !== null) {
                var accessName = accessProj.name;
                app.get('models').Project
                .findOne({
                    where: {id: projectId},
                })
                .then(function (resProject) {
                    if (resProject !== null) {
                        var owner = false;
                        if (profile === resProject.owner) {
                            owner = true;
                        }
                        var retProject = {
                            project: {
                                safeName: resProject.safeName,
                                code: resProject.code,
                                name: resProject.name,
                                access: accessName,
                                owner: owner,
                                description:
                                resProject.description,
                            }
                        };
                        response.push(retProject);
                    }
                    index++;
                    if (index === projectAccess.length) {
                        deffered.resolve(response);
                    }
                })
                .catch(function (error) {
                    var returnMessage = {
                        success: false,
                        code: 500,
                        error: error,
                        table: 'project_access',
                    };
                    deffered.reject(returnMessage);
                });
            }
        })
        .catch(function (error) {
            var returnMessage = {
                success: false,
                code: 500,
                error: error,
                table: 'project',
            };
            deffered.reject(returnMessage);
        });
    });
    return deffered.promise;
};

/**
 * Method that retrieves information from a project
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.email - The email of the owner
 * @param {string} data.code - The code of the project
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {string} returnMessage.code - The code of the project
 * @returns {string} returnMessage.safeName - The safeName of the project
 * @returns {string} returnMessage.name - The name of the project
 * @returns {string} returnMessage.description - The description of the project
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.getProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.code.length > 40) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param code must have max length of 40',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    if (data.email.length > 200) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param email must have max length of 200',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    this.getProjectAccess(data.email, data.code).then(
        function(res) {
            console.log(res.projectAccess)
             if (res.projectAccess !== null && res.projectAccess !== 'none'){
                 app.get('models').Project
                .findOne({
                    where: {code: data.code},
                })
                .then(function (project) {
                    if (project !== null) {
                        console.log('veio aqui')
                        // If found project
                        var owner = ((res.projectAccess === 'owner')
                        ? true : false);
                        var returnMessage = {
                            success: true,
                            code: project.code,
                            safeName: project.safeName,
                            description: project.description,
                            access: res.projectAccess,
                            owner: owner,
                            name: project.name,
                        };
                        deffered.resolve(returnMessage);
                    } else {
                        // If 404
                        returnMessage = {
                            success: false,
                            code: 404,
                            error: 'Could not find project',
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    }
                })
                .catch(function (error) {
                    var returnMessage = {
                        success: false,
                        code: 500,
                        error: error,
                        table: 'project',
                    };
                    deffered.reject(returnMessage);
                });
             } else {
                 // Does not have access
                 deffered.reject({
                    success: false,
                    code: 403,
                    error: 'Cannot get - User does not have access',
                    table: 'project',
                });
             }
        },
        function(err) {
            deffered.reject(err);
        }
    );
    return deffered.promise;
};

/**
 * Method updates an existing project
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.code - The code of the project
 * @param {string} data.email - The email of the profile
 * @param {string} data.name - The name of the project
 * @param {string} data.decription - The description of the project
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {string} returnMessage.safeName - The safeName of the project
 * @returns {string} returnMessage.code - The code of the project
 * @returns {string} returnMessage.name - The name of the project
 * @returns {string} returnMessage.description - The description of the project
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.updateProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.code.length > 40) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param code must have max length of 40',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    if (data.email.length > 200) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param email must have max length of 200',
            },
            table: 'profile',
        };
        deffered.reject(returnMessage);
    }
    if (data.name && data.name.length > 255) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param name must have max length of 255',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    this.getProjectAccess(data.email, data.code).then(
        function (res) {
            if (res.projectAccess !== null && res.projectAccess !== 'none'
            || res.projectAccess !== 'read') {
                app.get('models').Project
                    .findOne({
                        where: {
                            code: data.code,
                        },
                    })
                    .then(function (project) {
                        if (project !== null) {
                            project
                            .updateAttributes({
                                name: data.name,
                                description: data.description,
                            })
                            .then(function (updatedProj) {
                                if (updatedProj !== null) {
                                    var returnMessage = {
                                        success: true,
                                        code: updatedProj.code,
                                        name: updatedProj.name,
                                        description:
                                        updatedProj.description,
                                        safeName: updatedProj.safeName,
                                    };
                                    deffered.resolve(returnMessage);
                                } else {
                                    returnMessage = {
                                        success: false,
                                        code: 500,
                                        error: 'Could not update project',
                                        table: 'project',
                                    };
                                    deffered.reject(returnMessage);
                                }
                            })
                            .catch(function (error) {
                                var returnMessage = {
                                    success: false,
                                    code: 500,
                                    error: error,
                                    table: 'project',
                                };
                                deffered.reject(returnMessage);
                            });
                        } else {
                            var returnMessage = {
                                success: false,
                                code: 404,
                                error: 'Project not found',
                                table: 'project',
                            };
                            deffered.reject(returnMessage);
                        }
                    })
                    .catch(function (error) {
                        var returnMessage = {
                            success: false,
                            code: 500,
                            error: error,
                            table: 'project',
                        };
                        deffered.reject(returnMessage);
                    });
            } else {
                // Does not have access
                deffered.reject({
                    success: false,
                    code: 403,
                    error: 'Cannot update - Does not have write access',
                    table: 'project',
                });
            }
        },
        function (err) {
            deffered.reject(err);
        }
    );
    return deffered.promise;
};

/**
 * Method that deletes a project
 *
 * @function
 * @param {Object} data - Object containing necessary data
 * @param {string} data.code - The code of the project
 * @param {string} data.email - The email of the owner
 *
 * @returns {Object} returnMessage - Object with message
 * @returns {string} returnMessage.code - The code of the project
 * @returns {string} returnMessage.safeName - The safeName of the project
 * @returns {string} returnMessage.name - The name of the project
 * @returns {string} returnMessage.description - The description of the project
 * @returns {boolean} returnMessage.sucess - Operation success
 * @returns {Object} returnMessage.error - Error information
 * @returns {string} returnMessage.table - Table in which the error
 * occurred
 */
Project.prototype.deleteProject = function (data) {
    var deffered = q.defer();
    var returnMessage = null;
    // Verifications
    if (data.code.length > 40) {
        returnMessage = {
            success: false,
            code: 400,
            length: true,
            error: {
                message: 'Param code must have max length of 40',
            },
            table: 'project',
        };
        deffered.reject(returnMessage);
    }
    if (data.email.length > 200) {
        returnMessage = {
            success: false,
            code: 400,
            error: {
                message: 'Param email must have max length of 200',
            },
            table: 'profile',
        };
        deffered.reject(returnMessage);
    }

    this.getProjectAccess(data.email, data.code).then(
        function (res) {
            if (res.projectAccess !== null && res.projectAccess !== 'none') {
                var projectAccess = res.projectAccess;
                if (projectAccess === 'owner') {
                    app.get('models').Project
                    .findOne({
                        where: {
                            code: data.code,
                        }
                    })
                    .then(function (project) {
                        if (project !== null) {
                            project.destroy()
                            .then(function (projectDestroy) {
                                if (projectDestroy !== null) {
                                    // If it was destroyed, try todestroyaccess
                                    app.get('models').ProjectAccess
                                    .destroy({
                                        where: {project_id: project.id},
                                    })
                                    .then(function (projAccess) {
                                        // If access was destroyed, true
                                        var returnMessage = {
                                            success: true,
                                            code: data.code,
                                            safeName: data.safeName,
                                            name: project.name,
                                            description: 
                                            project.description,
                                        };
                                        deffered.resolve(returnMessage);
                                    })
                                    .catch(function (error) {
                                        deffered.reject({
                                            success: false,
                                            code: 500,
                                            error: error,
                                            table: 'project_access',
                                        });
                                    });
                                } else {
                                    deffered.reject({
                                        success: false,
                                        code: 500,
                                        error: 'Could not delete project',
                                        table: 'project',
                                    });
                                }
                            })
                            .catch(function (error) {
                                deffered.reject({
                                    success: false,
                                    code: 500,
                                    error: error,
                                    table: 'project',
                                });
                            });
                            
                        } else {
                            deffered.reject({
                                success: false,
                                code: 404,
                                error: 'Could not find project',
                                table: 'project',
                            });
                        }
                    })
                    .catch(function (error) {
                        deffered.reject({
                            success: false,
                            code: 500,
                            error: error,
                            table: 'project',
                        });
                    });
                } else {
                    deffered.reject({
                        success: false,
                        code: 403,
                        error: 'Cannot delete - Does not have write access',
                        table: 'project',
                    });
                }
            } else {
                deffered.reject({
                    success: false,
                    code: 403,
                    error: 'User does not have access to the project',
                    table: 'project_access',
                });
            }
        },
        function (err) {
            deffered.reject(err);
        });
    return deffered.promise;
};

/**
 * Gets the access to a project based on the user email
 *
 * @function
 * 
 * @param {string} email - The email of the logged user
 * @param {string} code - The code identifier of the project
 * 
 * @returns {number} ret.projectAccess - The access of the current user
 * @returns {string} ret.code - The the code of the error
 * @returns {string} ret.error - The error message
 * @returns {string} ret.table - The table where the error occured
 */
Project.prototype.getProjectAccess = function (email, code) {
    var deffered = q.defer();
    getProfileIdFromEmail(email).then(
        function (res) {
            var profileId = res.profileId;
            app.get('models').Project
            .findOne({
                where: {
                    code: code,
                }
            })
            .then(function (project) {
                if (project !== null) {
                    if (project.owner === profileId) {
                        // If the logged user is also the owner
                        deffered.resolve({
                            projectAccess: 'owner',
                        });
                    } else {
                        // It's not the owner, check access
                        app.get('models').ProjectAccess
                        .findOne({
                            where: {
                                project_id: project.id,
                                profile_id: profileId,
                            }
                        })
                        .then(function (projectAccess) {
                            if (projectAccess !== null) {
                                var access_level = projectAccess.access_type;
                                app.get('models').AccessLevel
                                .findOne({
                                    where: {id: access_level}
                                })
                                .then(function (access) {
                                    if (access != null) {
                                        deffered.resolve({
                                            projectAccess: access.name,
                                        });
                                    } else {
                                        deffered.reject({
                                            projectAccess: null,
                                            code: 404,
                                            error: 'AccessLevel not found',
                                            table: 'access_level',
                                        });
                                    }
                                })
                                .catch(function (error) {
                                    deffered.reject({
                                        projectAccess: null,
                                        code: 500,
                                        error: error,
                                        table: 'access_level',
                                    });
                                });
                            } else {
                                // Does not have access
                                deffered.resolve({
                                    projectAccess: 'none',
                                });
                            }
                        })
                        .catch(function (error) {
                            deffered.reject({
                                projectAccess: null,
                                code: 500,
                                error: error,
                                table: 'project_access',
                            });
                        });
                    }
                } else {
                    deffered.reject({
                        projectAccess: null,
                        code: 404,
                        error: 'Project not found',
                        table: 'project',
                    });
                }
            })
            .catch(function (error) {
                deffered.reject({
                    projectAccess: null,
                    code: 500,
                    error: error,
                    table: 'project',
                });
            });
        },
        function (err) {
            deffered.reject({
                projectAccess: null,
                code: err.code,
                error: err.error,
                table: err.table,
            });
        });
    return deffered.promise;
};

/**
 * Gets the profile id based on a user email
 *
 * @function
 * 
 * @returns {number} ret.profileId - The profile ID
 * @returns {string} ret.profileCode - The profile code
 * @returns {string} ret.code - The the code of the error
 * @returns {string} ret.error - The error message
 * @returns {string} ret.table - The table where the error occured
 */
var getProfileIdFromEmail = function (email) {
    var deffered = q.defer();
    app.get('models').User
    .findOne({
        where: {email: email}
    })
    .then(function (user) {
        if (user !== null) {
            user.getProfiles()
            .then(function (profile) {
                if (profile !== null) {
                    deffered.resolve({
                        profileId: profile[0].dataValues.id,
                        profileCode: profile[0].dataValues.code,
                    });
                } else {
                    deffered.reject({
                        profileId: null,
                        code: 404,
                        error: 'Profile not found',
                        table: 'profile',
                    });
                }
            })
            .catch(function (error) {
                deffered.reject({
                    profileId: null,
                    code: 500,
                    error: error,
                    table: 'profile',
                });
            });
        } else {
            deffered.reject({
                profileId: null,
                code: 404,
                error: 'User not found',
                table: 'user',
            });
        }
    })
    .catch(function (error) {
        deffered.reject({
            profileId: null,
            error: error,
            code: 500,
            table: 'user',
        });
    });
    return deffered.promise;
};

module.exports = Project;
