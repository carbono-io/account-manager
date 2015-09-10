'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('profile_user', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        freezeTableName: true,
        underscored: true,
    });
};
