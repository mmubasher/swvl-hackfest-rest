/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_faqs', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        answer: {
            type: DataTypes.TEXT,
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
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'jf_faqs'
    });
};
