/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_ratings', {
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
        fromUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'jf_users',
                key: 'id'
            }
        },
        trait1: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait2: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait3: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait4: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait5: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait6: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait7: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait8: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        trait9: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
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
        tableName: 'jf_ratings'
    });
};
