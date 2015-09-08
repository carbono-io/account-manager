'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        safeName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'safe_name',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        modified: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        owner: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });
};
