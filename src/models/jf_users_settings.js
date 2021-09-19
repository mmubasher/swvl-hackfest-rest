/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('jf_users_settings', {
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
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    locationEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    scoreScope: {
      type: DataTypes.ENUM('everyone', 'selective'),
      allowNull: true
    },
    isCaptainProfile: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    acceptAnonymousRating: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    facebookConnected: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    displayFacebookProfile: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    acceptRating: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
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
    tableName: 'jf_users_settings'
  });
};
