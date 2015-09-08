'use strict';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('profile_user', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'user_id',
        },
        profileId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'profile_id',
        },
    }, {
        freezeTableName: true,
    });
};
