'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        safeName: {
            type: DataTypes.STRING(80),
            allowNull: true,
            field: 'safe_name',
        },
        code: {
            type: DataTypes.STRING(40),
            allowNull: true,
            field: 'code',
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
        underscored: true,
    });
};
