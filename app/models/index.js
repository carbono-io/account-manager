'use strict';
var Sequelize = require('sequelize');

// Initializing Sequelize
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
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// Making associations
(function (m) {
    // FK - Project Access
    m.ProjectAccess.hasOne(m.Project, {
        foreignKey: {
            name: 'project_id',
        },
    });

    m.ProjectAccess.hasOne(m.Profile, {
        foreignKey: {
            name: 'profile_id',
        },
    });

    m.ProjectAccess.hasOne(m.AccessLevel, {
        foreignKey: {
            name: 'access_type',
        },
    });

    // FK - Project
    m.Project.hasOne(m.Profile, {
        foreignKey: {
            name: 'owner',
            allowNull: false,
        },
    });

    // FK - Profile
    m.Profile.hasOne(m.AccountType, {
        foreignKey: {
            name: 'account_id',
        },
    });

    m.Profile.belongsToMany(m.User, {
        as: {
            singular: 'user',
            plural: 'users',
        },
        through: m.ProfileUser,
        foreignKey: {
            name: 'profile_id',
        },
    });

    // FK - User
    m.User.belongsToMany(m.Profile, {
        as: {
            singular: 'profile',
            plural: 'profiles',
        },
        through: m.ProfileUser,
        foreignKey: {
            name: 'user_id',
        },
    });
}
)(module.exports);

module.exports.sequelize = sequelize;
