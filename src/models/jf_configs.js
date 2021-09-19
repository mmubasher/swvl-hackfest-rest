/* jshint indent: 2 */
"use strict";
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('jf_configs', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
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
    },
    imageURLs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    version: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    buildUpdatediOS: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'jf_configs'
  });
};
