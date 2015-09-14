'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project_access', {
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
