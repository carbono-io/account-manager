'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
            field: 'last_login',
        },
        email: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
    }, 
    {
        freezeTableName: true,
        underscored: true,
    });
};
