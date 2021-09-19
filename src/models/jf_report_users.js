/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_report_users', {
        id: {
            type: DataTypes.INTEGER,
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
        reportUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'jf_users',
                key: 'id'
            }
        },
        reportComment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        moderatorFeedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isResolved: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
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
        tableName: 'jf_report_users'
    });
};
