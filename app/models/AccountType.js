'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('account_type', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });
};
