'use strict';
var Sequelize = require('sequelize');

/**
 * This initializes the sequelize object and instantiates the communication
 * with the database
 *
 * @param {string} database - The name of the database
 * @param {string} username - The username of the database
 * @param {string} password - The password of the database
 * @param {string} host - The host name of the database
 * @param {string} dialect - The dialect of the database
 */
var sequelize = new Sequelize('carbono', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});


// Importing Models
var models = [
    'AccessLevel',
    'AccountType',
    'Profile',
    'ProfileUser',
    'Project',
    'ProjectAccess',
    'User',
];

// Exports each model
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

/**
 * This makes all the associations between the tables of the database
 * @function
 */
(function (m) {
    
    // Creates the profile_user table
    m.Profile.belongsToMany(m.User, {
        through: 'profile_user'
    });
    
    // Creates the profile_user table
    m.User.belongsToMany(m.Profile, {
        through: 'profile_user'
    });
    
    // Foreign key of Profile
    m.Profile.belongsTo(m.AccountType, {
        foreignKeyConstraint: true,
        foreignKey: 'account_id',
    });
    
    // Foreign key of Project
    m.Project.belongsTo(m.Profile, {
        foreignKeyConstraint: true,
        foreignKey: 'owner',
    });
    
    // Creates the association of project_acess
    m.Profile.belongsToMany(m.Project, {
        through: 'project_access'
    });
    
    m.Profile.belongsToMany(m.AccessLevel, {
        through: 'project_access'
    });

    m.Project.belongsToMany(m.Profile, {
        through: 'project_access'
    });
    
    m.AccessLevel.belongsToMany(m.Profile, {
        through: 'project_access',
        foreignKey: 'access_type',
    });
    
    m.AccessLevel.belongsToMany(m.Project, {
        through: 'project_access',
        foreignKey: 'access_type',
    });

}
)(module.exports);

// If is necessary force db construction -- sequelize.sync({force:true});

module.exports.sequelize = sequelize;
