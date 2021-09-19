/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('jf_users', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fullName: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    facebookId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fbProfileLink: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    longitude: {
      type: 'DOUBLE(18,8)',
      allowNull: true
    },
    latitude: {
      type: 'DOUBLE(18,8)',
      allowNull: true
    },
    authToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deviceUid: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deviceType: {
      type: DataTypes.ENUM('android', 'ios', 'web'),
      allowNull: true
    },
    deviceToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resetCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verificationCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    emailVerificationCode: {
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
    }
  }, {
    tableName: 'jf_users'
  });
};
