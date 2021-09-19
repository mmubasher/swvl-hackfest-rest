/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('jf_fellow_travellers', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    userId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'jf_users',
        key: 'id'
      }
    },
    userId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'jf_users',
        key: 'id'
      }
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
    tableName: 'jf_fellow_travellers'
  });
};
