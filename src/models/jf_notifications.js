/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_notifications', {
        id: {
            type: DataTypes.BIGINT,
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
        fromUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'jf_users',
                key: 'id'
            }
        },
        notificationType: {
            type: DataTypes.ENUM('ratingRequested', 'userRated', 'anonymousRated', 'inviteAccepted', 'ratingRequestedAgain', 'followRequest'),
            allowNull: true
        },
        isSeen: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        seenAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        jfIndex: {
            type: 'DOUBLE(18,8)',
            allowNull: true,
            defaultValue: 0.00000000
        },
        jfMultiplier: {
            type: 'DOUBLE(18,8)',
            allowNull: true,
            defaultValue: 0.00000000
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
        tableName: 'jf_notifications'
    });
};
