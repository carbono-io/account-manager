'use strict';
var Sequelize = require('sequelize');
var config = require('config');

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
var sequelize = new Sequelize(config.get('dbName'),
    config.get('dbUsername'), config.get('dbPassword'), {
        host: config.get('dbHost'),
        dialect: config.get('dbDialect'),

        pool: {
            max: 5,
            min: 0,
            idle: 10000,
        },
        // logging: false,

        storage: process.cwd() + config.get('dbPath'),
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
        through: 'profile_user',
    });

    // Creates the profile_user table
    m.User.belongsToMany(m.Profile, {
        through: 'profile_user',
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

    m.AccessLevel.belongsTo(m.Profile, {
        constraint: false,
        through: 'project_access',
        foreignKey: 'access_type',
        unique: false,
    });

    m.AccessLevel.belongsTo(m.Project, {
        constraint: false,
        through: 'project_access',
        foreignKey: 'access_type',
        unique: false,
    });

}
)(module.exports);

// sequelize.sync({force:true})
module.exports.sequelize = sequelize;
