/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jf_friends', {
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
        friendUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'jf_users',
                key: 'id'
            }
        },
        isSeen: {
      		  type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: 0
    	  },
    	  acceptRequest: {
      		  type: DataTypes.BOOLEAN,
          allowNull: true
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
        tableName: 'jf_friends'
    });
};
