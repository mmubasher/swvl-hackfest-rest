/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {    
    return sequelize.define('jf_multiplier_info', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'jf_users',
                key: 'id'
            }
        },
        isCaptainProfile: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        anonymousRatingGiven: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        acceptAnonymousFeedback: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        ratingsRequested: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        peopleInvited: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ratingsGiven: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        friendCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ratingsReceived: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        lastActivityTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        loginDays: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        lastRatingGiven: {
            type: DataTypes.DATE,
            allowNull: true
        },
        signupTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastRatingRequested: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 1
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'jf_multiplier_info'
    });
};
