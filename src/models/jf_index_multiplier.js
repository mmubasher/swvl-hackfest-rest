/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_index_multiplier', {
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
        jfIndex: {
            type: 'DOUBLE',
            allowNull: true
        },
        jfMultiplier: {
            type: 'DOUBLE',
            allowNull: true
        },
        rateOfChange: {
            type: 'DOUBLE',
            allowNull: true
        },
        appearanceAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        intelligenceAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        personalityAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        appearanceRateOfChange: {
            type: 'DOUBLE',
            allowNull: true
        },
        intelligenceRateOfChange: {
            type: 'DOUBLE',
            allowNull: true
        },
        personalityRateOfChange: {
            type: 'DOUBLE',
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
        tableName: 'jf_index_multiplier'
    });
};
