'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project_access', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        profile_id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
            unique: false,
        },
        project_id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
            unique: false,
        },
        access_type: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
            unique: false,
        },
    }, {
        freezeTableName: true,
        underscored: true,
    });
};
