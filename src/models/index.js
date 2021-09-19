'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const constants = require('../constants/constants');

const sequelize = new Sequelize(constants.CONFIGS.db.database, constants.CONFIGS.db.user, constants.CONFIGS.db.password, {
    host: constants.CONFIGS.db.host,
    dialect: 'mysql',
    dialectOptions: {
        multipleStatements: true
    },
    operatorsAliases: Sequelize.Op,
    pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        freezeTableName: true
    },
    logging: (str) => {
        //console.log("A query is executed, to see the query, log it, in models/index.js");
        //console.log(str);
        //console.log();
    },
});

const db = {};

fs
        .readdirSync(__dirname)
        .filter(function (file) {
            return (file.indexOf('.')!==0) && (file!=='index.js');
        })
        .forEach(function (file) {
            //console.log(file);
            var model = sequelize['import'](path.join(__dirname, file));
            db[model.name] = model;
            console.log('Loading model: ' + model.name);
        });


Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

//Relations Defining
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_USERS_SETTINGS], {
    as: 'settings',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_INDEX_INFO], {
    as: 'indexInfo',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_MULTIPLIER_INFO], {
    as: 'multiplierInfo',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_INDEX_MULTIPLIER], {
    as: 'indexMultiplier',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY], {
    as: 'initialHourlyData',
    foreignKey: 'userId',
    onDelete: 'cascade'
});

//following relation
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_FELLOW_TRAVELLERS], {
    as: 'travellerRelation',
    foreignKey: 'userId1',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_FELLOW_TRAVELLERS], {
    as: 'travelledWithRelation',
    foreignKey: 'userId2',
    onDelete: 'cascade'
});

db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_FRIENDS], {
    as: 'friendRelation',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_FRIENDS], {
    as: 'friendsWithRelation',
    foreignKey: 'friendUserId',
    onDelete: 'cascade'
});

//ratings relation
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_RATINGS], {
    as: 'ratingGivenRelation',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_RATINGS], {
    as: 'ratingGivenByRelation',
    foreignKey: 'fromUserId',
    onDelete: 'cascade'
});

//notifications relation
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_NOTIFICATIONS], {
    as: 'notifications',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_NOTIFICATIONS], {
    as: 'ratingRequested',
    foreignKey: 'userId',
    onDelete: 'cascade'
});

db[constants.MODELS.JF_NOTIFICATIONS].belongsTo(db[constants.MODELS.JF_USERS], {
    as: 'notificationFrom',
    foreignKey: 'fromUserId',
    onDelete: 'cascade'
});

db[constants.MODELS.JF_FRIENDS].belongsTo(db[constants.MODELS.JF_USERS], {
    as: 'followerDetail',
    foreignKey: 'friendUserId',
    onDelete: 'cascade'
});

//blocked users relation
db[constants.MODELS.JF_REPORT_USERS].belongsTo(db[constants.MODELS.JF_USERS], {
    as: 'reportedByRelation',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_REPORT_USERS].belongsTo(db[constants.MODELS.JF_USERS], {
    as: 'reportedUserRelation',
    foreignKey: 'reportUserId',
    onDelete: 'cascade'
});

//blocked users relation - From jf_users to jf_block_users
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_REPORT_USERS], {
    as: 'reportedByThem',
    foreignKey: 'userId',
    onDelete: 'cascade'
});
db[constants.MODELS.JF_USERS].hasOne(db[constants.MODELS.JF_REPORT_USERS], {
    as: 'reportedByMe',
    foreignKey: 'reportUserId',
    onDelete: 'cascade'
});

//Rate user - userSettings relation with followers
db[constants.MODELS.JF_USERS_SETTINGS].hasOne(db[constants.MODELS.JF_FELLOW_TRAVELLERS], {
    as: 'followerRelation',
    foreignKey: 'userId',
    onDelete: 'cascade'
});

db[constants.MODELS.JF_INDEX_INFO].hasOne(db[constants.MODELS.JF_MULTIPLIER_INFO], {
    as: 'multiplierInfo',
    foreignKey: 'userId',
    targetKey: 'userId'
});
db[constants.MODELS.JF_INDEX_INFO].hasOne(db[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY], {
    as: 'oldJfInfo',
    foreignKey: 'userId',
    targetKey: 'userId'
});
db[constants.MODELS.JF_INDEX_MULTIPLIER].hasMany(db[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_DAILY], {
    as: 'graphData',
    foreignKey: 'userId',
    targetKey: 'userId'
});
db[constants.MODELS.JF_INDEX_MULTIPLIER].hasMany(db[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY], {
    as: 'graphDataHourly',
    foreignKey: 'userId',
    targetKey: 'userId'
});

db[constants.MODELS.JF_RATINGS].belongsTo(db[constants.MODELS.JF_USERS], {
    as: 'ratingGivenBy',
    foreignKey: 'fromUserId',
    onDelete: 'cascade'
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
