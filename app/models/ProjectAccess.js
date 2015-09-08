'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project_access', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        profileId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'profile_id',
        },
        projectId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'project_id',
        },
        accessType: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'access_type',
        },
    }, {
        freezeTableName: true,
    });
};
