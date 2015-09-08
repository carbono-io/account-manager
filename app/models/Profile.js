'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('profile', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        accountId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'account_id',
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'first_name',
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'last_name',
        },
        created: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        modified: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });
};
