'use strict';


module.exports = function (app) {
    var q = require('q');
    var CustomException = require('../lib/exceptions');
    CustomException = new CustomException();
    
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
     * @returns {Boolean} returnMessage.sucess - Operation success
     * @returns {Object} returnMessage.error - Error information
     * @returns {string} returnMessage.table - Table in which the error
     * occurred
     */
    this.newAccount = function(data) {
        var deffered = q.defer();
        // Verifications
        if (data.name.length > 200) {
            throw new CustomException.StringLengthException('name', 200,
            data.name);
        }
        
        if (data.email.length > 200) {
            throw new CustomException.StringLengthException('email', 200,
            data.email);
        }
        
        if (data.password.length > 60) {
            throw new CustomException.StringLengthException('password', 60,
            data.password);
        }
        
        if (data.code.length > 40) {
            throw new CustomException.StringLengthException('code', 40,
            data.password);
        }
        
        var User = app.get('models').User;
        
        User
            .build({
                email: data.email,
                password: data.password,
            })
            .save()
            .then(function(user) {
                
                var Profile = app.get('models').Profile;
                Profile.build({
                    firstName: data.name,
                    lastName: '',
                    code: data.code,
                })
                .save()
                .then(function(profile) {

                    profile.addUsers(user).then(function(ret) {

                        var returnMessage = {
                            success: true,
                        };
                        deffered.resolve(returnMessage);
                    })
                    .catch(function(error) {
                        var returnMessage = {
                            success: false,
                            error: error,
                            table: 'profile_user',
                        };
                        deffered.reject(returnMessage);
                    });
                })
                .catch(function(error) {
                    var returnMessage = {
                        success: false,
                        error: error,
                        table: 'profile',
                    };
                    deffered.reject(returnMessage);
                });
            })
            .catch(function(error) {
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
     * @returns {Boolean} returnMessage.sucess - Operation success
     * @returns {string} returnMessage.id - The id of the profile
     * @returns {string} returnMessage.name - The name of the user
     * @returns {string} returnMessage.email - The email of the user
     * @returns {string} returnMessage.password - The password of the user
     * @returns {Object} returnMessage.error - Error information
     * @returns {string} returnMessage.table - Table in which the error
     */
    this.getUserAccount = function(data) {
        var deffered = q.defer();
        
        // Validation
        if (data.code.length > 40) {
            throw new CustomException.StringLengthException('code', 40, 
            data.password);
        }

        var Profile = app.get('models').Profile;
        Profile
        .findOne({
            where: {code: data.code},
        })
        .then(function(profile) {
            profile.getUsers()
            .then(function(ret) {
                var returnMessage = {
                    success: true,
                    id: 0,
                    name: profile.get().first_name,
                    email: ret[0].dataValues.email,
                    password: ret[0].dataValues.password,
                };
                deffered.resolve(returnMessage);
            }).catch(function(error) {
                var returnMessage = {
                    success: false,
                    error: error,
                    table: 'user',
                };
                deffered.reject(returnMessage);
            });
            
        }).catch(function(error) {
            var returnMessage = {
                success: false,
                error: error,
                table: 'profile',
            };
            deffered.reject(returnMessage);
        });
        return deffered.promise;
    }
    
    return this;
};
