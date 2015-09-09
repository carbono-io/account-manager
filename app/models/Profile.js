'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('profile', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING(40),
            allowNull: true,
            unique: true,
        },
        firstName: {
            type: DataTypes.STRING(200),
            allowNull: true,
            field: 'first_name',
        },
        lastName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'last_name',
        }
    }, {
        freezeTableName: true,
        underscored: true,
    });
};
