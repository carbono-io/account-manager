'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        active: {
            type: 'BIT(1)',
            allowNull: false,
            defaultValue: 'b\'0\'',
        },
        modified: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
            field: 'last_login',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });
};
