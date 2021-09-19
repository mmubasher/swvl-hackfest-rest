/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_index_info', {
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
        traitAppearanceAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitPersonalityAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitIntelligenceAverage: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitAppearanceTotal: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitPersonalityTotal: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitIntelligenceTotal: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitAppearanceAverageBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitPersonalityAverageBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitIntelligenceAverageBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitAppearanceTotalBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitPersonalityTotalBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitIntelligenceTotalBk: {
            type: 'DOUBLE',
            allowNull: true
        },
        traitAppearanceCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        traitPersonalityCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        traitIntelligenceCount: {
            type: DataTypes.INTEGER,
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
        tableName: 'jf_index_info'
    });
};
