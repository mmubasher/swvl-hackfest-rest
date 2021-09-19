'use strict';

const BaseController = require('./base_controller');
const ResponseUtility = require('../utilities/responseHandling');
const ErrorUtility = require('../utilities/errorHandling');
const QueryUtility = require('../utilities/query');
const PaginationUtility = require('../utilities/pagination');
const TimeUtililty = require('../utilities/time');


const constants = require('../constants/constants');
const models = require('../models');
const async = require('async');
const sleep = require('system-sleep');

class JFIndexCalculater {

    static getSmallRangeFactor(counter) {
        let multiplier = 0;
        let subtractionFactor = 0;
        let initialAdditionFactor = 0;

        if (counter < 0 || counter==null) {
            multiplier = 0;
            subtractionFactor = 0;
            initialAdditionFactor = 0;
            counter = 0;
        } else if (counter < 101) {
            multiplier = (0.1 - 0.01) / 100; //0.0009
            subtractionFactor = 0;
            initialAdditionFactor = 0.01;
        } else if (counter < 201) {
            multiplier = (1 - 0.1) / 100; //0.009;
            subtractionFactor = 100;
            initialAdditionFactor = 0.1;
        } else if (counter < 401) {
            multiplier = (5 - 1) / 200; //0.02
            subtractionFactor = 200;
            initialAdditionFactor = 1;
        } else if (counter < 601) {
            multiplier = (10 - 5) / 200; //0.025;            
            subtractionFactor = 400;
            initialAdditionFactor = 5;
        } else if (counter < 801) {
            multiplier = (15 - 10) / 200; //0.025;
            subtractionFactor = 600;
            initialAdditionFactor = 10;
        } else if (counter < 1001) {
            multiplier = (20 - 15) / 200; //(0.025);
            subtractionFactor = 800;
            initialAdditionFactor = 15;
        } else if (counter > 1000) {
            multiplier = 0;
            subtractionFactor = 0;
            initialAdditionFactor = 20;
        }

        let finalPercentage = ((counter - subtractionFactor) * multiplier) + initialAdditionFactor;
        finalPercentage = (finalPercentage / 100) + 1;
        return finalPercentage;
    }

    static getLargeRangeFactor(counter) {
        let multiplier = 0;
        let subtractionFactor = 0;
        let initialAdditionFactor = 0;

        if (counter < 0 || counter==null) {
            multiplier = 0;
            subtractionFactor = 0;
            initialAdditionFactor = 0;
            counter = 0;
        } else if (counter < 101) {
            multiplier = (0.1 - 0.01) / 100; //0.0009
            subtractionFactor = 0;
            initialAdditionFactor = 0.01;
        } else if (counter < 201) {
            multiplier = (1 - 0.1) / 100; //0.009;
            subtractionFactor = 100;
            initialAdditionFactor = 0.1;
        } else if (counter < 401) {
            multiplier = (5 - 1) / 200; //0.02
            subtractionFactor = 200;
            initialAdditionFactor = 1;
        } else if (counter < 601) {
            multiplier = (10 - 5) / 200; //0.025;            
            subtractionFactor = 400;
            initialAdditionFactor = 5;
        } else if (counter < 801) {
            multiplier = (15 - 10) / 200; //0.025;
            subtractionFactor = 600;
            initialAdditionFactor = 10;
        } else if (counter < 1001) {
            multiplier = (20 - 15) / 200; //(0.025);
            subtractionFactor = 800;
            initialAdditionFactor = 15;
        } else if (counter < 10001) {
            multiplier = (30 - 20) / 9000; //(0.025);
            subtractionFactor = 1000;
            initialAdditionFactor = 20;
        } else if (counter < 100001) {
            multiplier = (40 - 30) / 90000; //(0.025);
            subtractionFactor = 10000;
            initialAdditionFactor = 30;
        } else if (counter < 1000001) {
            multiplier = (50 - 40) / 900000; //(0.025);
            subtractionFactor = 100000;
            initialAdditionFactor = 40;
        } else if (counter < 10000001) {
            multiplier = (60 - 50) / 9000000; //(0.025);
            subtractionFactor = 1000000;
            initialAdditionFactor = 50;
        } else if (counter > 10000000) {
            multiplier = 0;
            subtractionFactor = 0;
            initialAdditionFactor = 60;
        }

        let finalPercentage = ((counter - subtractionFactor) * multiplier) + initialAdditionFactor;
        finalPercentage = (finalPercentage / 100) + 1;
        return finalPercentage;
    }


    static getRequestRatingFactor(ratingsRequest) {
        return this.getSmallRangeFactor(ratingsRequest);
    }

    static getFollowersFactor(followers) {
        return this.getLargeRangeFactor(followers);
    }

    static getInvitationsFactor(invitations) {
        return this.getSmallRangeFactor(invitations);
    }

    static getRatingsGivenFactor(ratingsGiven) {
        return this.getSmallRangeFactor(ratingsGiven);
    }

    static getRatingsReceivedFactor(ratingsReceived) {
        return this.getLargeRangeFactor(ratingsReceived);
    }

    static getMultiplicationFactor(multiplierInfo) {
        let multiplier = 1;

        if (multiplierInfo.isCaptainProfile==true) {
            multiplier = multiplier * 1.01;
        }
        if (multiplierInfo.anonymousRatingGiven==false) {
            multiplier = multiplier * 1.01;
        }
        if (multiplierInfo.acceptAnonymousFeedback==true) {
            multiplier = multiplier * 1.01;
        }

        multiplier = multiplier * this.getRequestRatingFactor(multiplierInfo.ratingsRequested);
        multiplier = multiplier * this.getInvitationsFactor(multiplierInfo.peopleInvited);
        multiplier = multiplier * this.getRatingsGivenFactor(multiplierInfo.ratingsGiven);
        multiplier = multiplier * this.getFollowersFactor(multiplierInfo.followers);
        multiplier = multiplier * this.getRatingsReceivedFactor(multiplierInfo.ratingsReceived);
        let loginIntervalCategory = this.getLoginInterval(multiplierInfo.lastActivityTime, multiplierInfo.loginDays, multiplierInfo.signupTime);
        //1 for daily, 2 for weekly, 3 for monthly, and 4 for yearly and O for none;
        multiplier = multiplier * this.getLastLoginFactor(loginIntervalCategory);


        ////////////////////////DECREASING IMPACTS ////////////////////////////////////////////////////
        if (multiplierInfo.lastRatingGiven!=null) {
            let daysSinceLastRatingGiven = TimeUtililty.numberOfDaysPassed(multiplierInfo.lastRatingGiven);
            multiplier = multiplier * this.getLastRatingGivenTimeFactor(daysSinceLastRatingGiven);
        }

        if (multiplierInfo.lastRatingRequested!=null) {
            let daysSinceLastRatingRequested = TimeUtililty.numberOfDaysPassed(multiplierInfo.lastRatingRequested);
            multiplier = multiplier * this.getLastRatingRequestedTimeFactor(daysSinceLastRatingRequested);
        }

        return multiplier;
    }

    static getJFIndexAverage(indexInfo) {
        let output = indexInfo.traitPersonalityAverage + indexInfo.traitAppearanceAverage + indexInfo.traitIntelligenceAverage;
        return output;
    }

    static getLastRatingGivenTimeFactor(daysPassed) {
        let percentageFactor = 0;
        if (daysPassed <= 7) {
            percentageFactor = 0.1;
        } else if (daysPassed <= 30) {
            percentageFactor = 1;
        } else {
            percentageFactor = 5;
        }

        return 1 - (percentageFactor / 100);

    }

    static getLastRatingRequestedTimeFactor(daysPassed) {
        let percentageFactor = 0;
        if (daysPassed <= 7) {
            percentageFactor = 0.1;
        } else if (daysPassed <= 30) {
            percentageFactor = 1;
        } else {
            percentageFactor = 5;
        }

        return 1 - (percentageFactor / 100);

    }

    static getLastLoginFactor(category) {
        let percentageFactor = 0;

        if (category==1) {
            percentageFactor = 1;
        } else if (category==2) {
            percentageFactor = 0.1;
        } else if (category==3) {
            percentageFactor = 0.01;
        } else if (category==4) {
            percentageFactor = 0.01;
        }

        percentageFactor = (percentageFactor / 100) + 1;
        return percentageFactor;
    }

    static getLoginInterval(lastActivityTime, daysLogin, signUpTime) {
        let numberOfDaysPassed = TimeUtililty.numberOfDaysPassed(signUpTime);
        if (numberOfDaysPassed < 7) {
            return 1; //daily
        }

        let loginPercentage = daysLogin / numberOfDaysPassed * 100;
        if (loginPercentage > 90) {
            return 1; //daily
        }

        let numberOfDaysForLastActivity = TimeUtililty.numberOfDaysPassed(lastActivityTime);
        if (numberOfDaysForLastActivity <= 7) {
            return 2; //weekly
        }

        if (numberOfDaysForLastActivity <= 30) {
            return 3; //monthly
        }

        if (numberOfDaysForLastActivity <= 365) {
            return 4;
        }

        return 0;
    }
}

module.exports = class JFIndexController extends BaseController {

    /**
     * Updates the user JF Index Information with the accurate information, for a particular user and will return the updated information
     * @param {*} userId
     * @param {*} cb
     */

    static cleanJFIndexHistoryHourly() {
        let options = {
            where: {
                createdAt: {
                    [models.sequelize.Op.lt]: TimeUtililty.getPreviousDateTime(1)
                }
            }
        };
        models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY].destroy(options).then(response => {
        }, err => {
            console.log(err.response);
        });
    }

    static getMultiplicationFactor(multiplierInfo) {
        return JFIndexCalculater.getMultiplicationFactor(multiplierInfo);
    }

    static getJFIndexAverage(indexInfo) {
        return JFIndexCalculater.getJFIndexAverage(indexInfo);
    }

    static updateJFIndexHistoryHourly() {
        let query = `INSERT into ${constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY} (userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, createdAt, updatedAt)
        select userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, '${TimeUtililty.currentTimeUTC()}', '${TimeUtililty.currentTimeUTC()}' from ${constants.MODELS.JF_INDEX_MULTIPLIER} where isDeleted = 0`;
        models.sequelize.query(query).then(response => {
        }, err => {
            console.log(err.message);
        });
    }

    static updateJFIndexHistoryDaily() {
        let query = `INSERT into ${constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_DAILY} (userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, processingTime, createdAt, updatedAt)
        select userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, '${TimeUtililty.currentTimeUTC()}' ,'${TimeUtililty.currentTimeUTC()}', '${TimeUtililty.currentTimeUTC()}' from ${constants.MODELS.JF_INDEX_MULTIPLIER} where isDeleted = 0`;
        models.sequelize.query(query).then(response => {
        }, err => {
            console.log(err.message);
        });
    }

    static calculateRateOfChanges(JFIM, oldJFIM, traitAppearanceAverage, traitAppearanceAverageOld, traitIntelligenceAverage, traitIntelligenceAverageOld, traitPersonalityAverage, traitPersonalityAverageOld) {
        let rateOfChange = 100;
        let appearanceRateOfChange = 100;
        let intelligenceRateOfChange = 100;
        let personalityRateOfChange = 100;


    }
    // this func has recurssion in it
    static processJFIndexN(limit, page) {

        let funcs = {};
        funcs.getUserIdsToProcess = (cb) => {
            let options = {};
            const offset = PaginationUtility.getOffset(page, limit);
            options.offset = offset;
            options.limit = limit;

            options.where = {
                isDeleted: 0
            };
            options.attributes = ['userId'];
            models[constants.MODELS.JF_INDEX_INFO].findAll(options).then(response => {
                let userIds = this._makeArray(response, 'userId');
                if (userIds.length > 0) {
                    cb(null, userIds);
                    return;
                }
                cb(null, false);
            }, err => {
                cb(err);
            });
        }

        funcs.getHourlyInfoIdsToProcess = (getUserIdsToProcess, cb) => {
            if (getUserIdsToProcess==false) {
                cb(null, false);
                return;
            }
            let options = {
                where: {
                    userId: {
                        [models.sequelize.Op.in]: getUserIdsToProcess
                    }
                },
                attributes: [
                    [models.sequelize.fn('MIN', models.sequelize.col('id')), 'id']
                ],
                group: 'userId'
            }
            models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY].findAll(options).then(response => {
                let recordIds = this._makeArray(response, 'id');
                cb(null, recordIds);
            }, err => {
                cb(err);
            });
        }

        funcs.getJFIndexInformation = (getUserIdsToProcess, getHourlyInfoIdsToProcess, cb) => {
            if (getUserIdsToProcess==false) {
                cb(null, false);
                return;
            }
            let options = {};

            options.where = {
                isDeleted: 0,
                userId: {
                    [models.sequelize.Op.in]: getUserIdsToProcess
                }
            }

            options.attributes = ['userId', 'traitAppearanceAverage', 'traitPersonalityAverage', 'traitIntelligenceAverage'];
            options.include = [{
                model: models[constants.MODELS.JF_MULTIPLIER_INFO],
                as: 'multiplierInfo',
                attributes: {
                    exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                }
            },
                {
                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY],
                    as: 'oldJfInfo',
                    attributes: {
                        exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                    },
                    where: {
                        id: {
                            [models.sequelize.Op.in]: getHourlyInfoIdsToProcess
                        }
                    },
                    required: false
                }
            ];
            models[constants.MODELS.JF_INDEX_INFO].findAll(options).then(data => {
                cb(null, data);
            }, err => {
                cb(err);
            });
        }

        funcs.updateJFIndex = (getJFIndexInformation, cb) => {
            if (getJFIndexInformation==false) {
                cb(null, false);
                return;
            }
            let updateQuery = '';
            for (let i = 0; i < getJFIndexInformation.length; i++) {
                let indexInfo = getJFIndexInformation[i].dataValues;
                indexInfo.multiplierInfo = indexInfo.multiplierInfo.dataValues;

                if (indexInfo.oldJfInfo!=null) {
                    indexInfo.oldJfInfo = indexInfo.oldJfInfo.dataValues;
                }

                let multiplier = JFIndexCalculater.getMultiplicationFactor(indexInfo.multiplierInfo);
                let JFI = JFIndexCalculater.getJFIndexAverage(indexInfo);
                let JFIM = multiplier * JFI;

                let rateOfChange = 0;
                let appearanceRateOfChange = 0;
                let intelligenceRateOfChange = 0;
                let personalityRateOfChange = 0;
                if (indexInfo.oldJfInfo!=null && JFIM!=0) {

                    let previousJFIM = indexInfo.oldJfInfo.jfIndex * indexInfo.oldJfInfo.jfMultiplier;
                    if (previousJFIM==0) {
                        rateOfChange = 100;
                    } else {
                        rateOfChange = ((JFIM - previousJFIM) / previousJFIM) * 100;
                    }
                    rateOfChange = Math.round(rateOfChange * 1000) / 1000.0;


                    if (indexInfo.traitAppearanceAverage > 0) {
                        if (indexInfo.oldJfInfo.appearanceAverage==0) {
                            appearanceRateOfChange = ((indexInfo.traitAppearanceAverage - indexInfo.oldJfInfo.appearanceAverage) / indexInfo.traitAppearanceAverage) * 100;
                        } else {
                            appearanceRateOfChange = ((indexInfo.traitAppearanceAverage - indexInfo.oldJfInfo.appearanceAverage) / indexInfo.oldJfInfo.appearanceAverage) * 100;
                        }
                        appearanceRateOfChange = Math.round(appearanceRateOfChange * 1000) / 1000.0;
                    }

                    if (indexInfo.traitIntelligenceAverage > 0) {
                        if (indexInfo.oldJfInfo.intelligenceAverage==0) {
                            intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.traitIntelligenceAverage) * 100;
                        } else {
                            intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.oldJfInfo.intelligenceAverage) * 100;
                        }
                        //intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.traitIntelligenceAverage) * 100
                        intelligenceRateOfChange = Math.round(intelligenceRateOfChange * 1000) / 1000.0;
                    }

                    if (indexInfo.traitPersonalityAverage > 0) {
                        if (indexInfo.oldJfInfo.personalityAverage==0) {
                            personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.traitPersonalityAverage) * 100;
                        } else {
                            personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.oldJfInfo.personalityAverage) * 100;
                        }
                        // personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.traitPersonalityAverage) * 100
                        personalityRateOfChange = Math.round(personalityRateOfChange * 1000) / 1000.0;
                    }
                }


                updateQuery = updateQuery + `UPDATE ${constants.MODELS.JF_INDEX_MULTIPLIER} SET 
                jfIndex = ${JFI}, jfMultiplier = ${multiplier}, rateOfChange = ${rateOfChange},
                appearanceAverage = ${indexInfo.traitAppearanceAverage}, intelligenceAverage = ${indexInfo.traitIntelligenceAverage}, personalityAverage = ${indexInfo.traitPersonalityAverage},
                appearanceRateOfChange = ${appearanceRateOfChange}, intelligenceRateOfChange = ${intelligenceRateOfChange}, personalityRateOfChange = ${personalityRateOfChange}
                WHERE userId = ${indexInfo.userId}; 
                `;
            }

            models.sequelize.query(updateQuery).then(response => {
                cb(null, response);
            }, err => {
                cb(err);
            });
        }

        async.autoInject(funcs, (err, response) => {
            if (err) {
                console.log(err.message);
            } else if (response.getUserIdsToProcess==false) {
                if (constants.CONFIGS.code_environment=='production') {
                    sleep(3000);
                    console.log('Processing the users again');
                    JFIndexController.processJFIndexN(limit, 1);
                } else {
                    console.log('Successfully updated all the users index_multiplier');
                }
            } else {
                JFIndexController.processJFIndexN(limit, page + 1);
            }
        });
    }

    static updateJFIndexAll() {
        this.processJFIndexN(100, 1);
    }

    static updateJFIndexUser(userId, callback) {

        let funcs = {};

        funcs.getHourlyInfoIdsToProcess = (cb) => {
            let options = {
                where: {
                    userId: userId
                },
                attributes: [
                    [models.sequelize.fn('MIN', models.sequelize.col('id')), 'id']
                ]
            }
            models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY].findAll(options).then(response => {
                let recordIds = this._makeArray(response, 'id');
                cb(null, recordIds);
            }, err => {
                cb(err);
            });
        }

        funcs.getJFIndexInformation = (getHourlyInfoIdsToProcess, cb) => {
            if (getHourlyInfoIdsToProcess==null) {
                cb(null, false);
                return;
            }
            let options = {};

            options.where = {
                isDeleted: 0,
                userId: userId
            }

            options.attributes = ['userId', 'traitAppearanceAverage', 'traitPersonalityAverage', 'traitIntelligenceAverage'];
            options.include = [{
                model: models[constants.MODELS.JF_MULTIPLIER_INFO],
                as: 'multiplierInfo',
                attributes: {
                    exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                }
            },
                {
                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY],
                    as: 'oldJfInfo',
                    attributes: {
                        exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                    },
                    where: {
                        id: {
                            [models.sequelize.Op.in]: getHourlyInfoIdsToProcess
                        }
                    },
                    required: false
                }
            ];
            models[constants.MODELS.JF_INDEX_INFO].findAll(options).then(data => {
                cb(null, data);
            }, err => {
                cb(err);
            });
        }

        funcs.updateJFIndex = (getJFIndexInformation, cb) => {
            if (getJFIndexInformation==false) {
                cb(null, false);
                return;
            }
            let updateQuery = '';
            let userJFI = 0;
            let userMultiplier = 0;
            for (let i = 0; i < getJFIndexInformation.length; i++) {
                let indexInfo = getJFIndexInformation[i].dataValues;
                indexInfo.multiplierInfo = indexInfo.multiplierInfo.dataValues;

                if (indexInfo.oldJfInfo!=null) {
                    indexInfo.oldJfInfo = indexInfo.oldJfInfo.dataValues;
                }

                let multiplier = JFIndexCalculater.getMultiplicationFactor(indexInfo.multiplierInfo);
                let JFI = JFIndexCalculater.getJFIndexAverage(indexInfo);
                let JFIM = multiplier * JFI;
                userJFI = JFI;
                userMultiplier = multiplier;

                let rateOfChange = 0;
                let appearanceRateOfChange = 0;
                let intelligenceRateOfChange = 0;
                let personalityRateOfChange = 0;
                if (indexInfo.oldJfInfo!=null && JFIM!=0) {

                    let previousJFIM = indexInfo.oldJfInfo.jfIndex * indexInfo.oldJfInfo.jfMultiplier;
                    if (previousJFIM==0) {
                        rateOfChange = 100;
                    } else {
                        rateOfChange = ((JFIM - previousJFIM) / previousJFIM) * 100;
                    }
                    rateOfChange = Math.round(rateOfChange * 1000) / 1000.0;


                    if (indexInfo.traitAppearanceAverage > 0) {
                        if (indexInfo.oldJfInfo.appearanceAverage==0) {
                            appearanceRateOfChange = ((indexInfo.traitAppearanceAverage - indexInfo.oldJfInfo.appearanceAverage) / indexInfo.traitAppearanceAverage) * 100;
                        } else {
                            appearanceRateOfChange = ((indexInfo.traitAppearanceAverage - indexInfo.oldJfInfo.appearanceAverage) / indexInfo.oldJfInfo.appearanceAverage) * 100;
                        }
                        appearanceRateOfChange = Math.round(appearanceRateOfChange * 1000) / 1000.0;
                    }

                    if (indexInfo.traitIntelligenceAverage > 0) {
                        if (indexInfo.oldJfInfo.intelligenceAverage==0) {
                            intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.traitIntelligenceAverage) * 100;
                        } else {
                            intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.oldJfInfo.intelligenceAverage) * 100;
                        }
                        //intelligenceRateOfChange = ((indexInfo.traitIntelligenceAverage - indexInfo.oldJfInfo.intelligenceAverage) / indexInfo.traitIntelligenceAverage) * 100
                        intelligenceRateOfChange = Math.round(intelligenceRateOfChange * 1000) / 1000.0;
                    }

                    if (indexInfo.traitPersonalityAverage > 0) {
                        if (indexInfo.oldJfInfo.personalityAverage==0) {
                            personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.traitPersonalityAverage) * 100;
                        } else {
                            personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.oldJfInfo.personalityAverage) * 100;
                        }
                        // personalityRateOfChange = ((indexInfo.traitPersonalityAverage - indexInfo.oldJfInfo.personalityAverage) / indexInfo.traitPersonalityAverage) * 100
                        personalityRateOfChange = Math.round(personalityRateOfChange * 1000) / 1000.0;
                    }
                }


                updateQuery = updateQuery + `UPDATE ${constants.MODELS.JF_INDEX_MULTIPLIER} SET 
            jfIndex = ${JFI}, jfMultiplier = ${multiplier}, rateOfChange = ${rateOfChange},
            appearanceAverage = ${indexInfo.traitAppearanceAverage}, intelligenceAverage = ${indexInfo.traitIntelligenceAverage}, personalityAverage = ${indexInfo.traitPersonalityAverage},
            appearanceRateOfChange = ${appearanceRateOfChange}, intelligenceRateOfChange = ${intelligenceRateOfChange}, personalityRateOfChange = ${personalityRateOfChange}
            WHERE userId = ${indexInfo.userId}; 
            `;
            }

            models.sequelize.query(updateQuery).then(response => {
                let userDetail = {
                    jfIndex: userJFI,
                    jfMultiplier: userMultiplier
                };
                cb(null, userDetail);
            }, err => {
                cb(err);
            });
        }

        async.autoInject(funcs, (err, response) => {
            if (callback!=null) {
                callback(err, response.updateJFIndex);
            }
        });
    }

    static updateJFIndex(userId) {
        let funcs = {};
        funcs.getHourlyInfoIdToProcess = (cb) => {
            let options = {
                where: {
                    userId: userId
                },
                attributes: [
                    [models.sequelize.fn('MIN', models.sequelize.col('id')), 'id']
                ],
                group: 'userId'
            }
            models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY].findAll(options).then(response => {
                let recordIds = this._makeArray(response, 'id');
                cb(null, recordIds);
            }, err => {
                cb(err);
            });
        }

        funcs.getJFIndexInformation = (getHourlyInfoIdToProcess, cb) => {

            let options = {};

            options.where = {
                isDeleted: 0,
                userId: userId
            }

            options.attributes = ['userId', 'traitAppearanceAverage', 'traitPersonalityAverage', 'traitIntelligenceAverage'];
            options.include = [{
                model: models[constants.MODELS.JF_MULTIPLIER_INFO],
                as: 'multiplierInfo',
                attributes: {
                    exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                }
            },
                {
                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY],
                    as: 'oldJfInfo',
                    attributes: {
                        exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
                    },
                    where: {
                        id: {
                            [models.sequelize.Op.in]: getHourlyInfoIdToProcess
                        }
                    },
                    required: false
                }
            ];
            models[constants.MODELS.JF_INDEX_INFO].findAll(options).then(data => {
                cb(null, data);
            }, err => {
                cb(err);
            });
        }

        funcs.updateJFIndex = (getJFIndexInformation, cb) => {
            if (getJFIndexInformation==false) {
                cb(null, false);
                return;
            }
            let updateQuery = '';
            for (let i = 0; i < getJFIndexInformation.length; i++) {
                let indexInfo = getJFIndexInformation[i].dataValues;
                indexInfo.multiplierInfo = indexInfo.multiplierInfo.dataValues;

                if (indexInfo.oldJfInfo!=null) {
                    indexInfo.oldJfInfo = indexInfo.oldJfInfo.dataValues;
                }

                let multiplier = JFIndexCalculater.getMultiplicationFactor(indexInfo.multiplierInfo);
                let JFI = JFIndexCalculater.getJFIndexAverage(indexInfo);
                let JFIM = multiplier * JFI;

                let rateOfChange = 0;
                if (indexInfo.oldJfInfo!=null && JFIM!=0) {
                    let previousJFIM = indexInfo.oldJfInfo.jfIndex * indexInfo.oldJfInfo.jfMultiplier;
                    if (previousJFIM==0) {
                        rateOfChange = 100;
                    } else {
                        rateOfChange = ((JFIM - previousJFIM) / previousJFIM) * 100;
                    }
                    rateOfChange = Math.round(rateOfChange * 1000) / 1000.0;

                }

                updateQuery = updateQuery + `UPDATE ${constants.MODELS.JF_INDEX_MULTIPLIER} SET jfIndex = ${JFI}, jfMultiplier = ${multiplier}, rateOfChange = ${rateOfChange} WHERE userId = ${indexInfo.userId}; 
                    `;
            }

            models.sequelize.query(updateQuery).then(response => {
                cb(null, response);
            }, err => {
                cb(err);
            });
        }

        async.autoInject(funcs, (err, response) => {
            if (err) {
            }
        });
        /*
             const funcs = {};
             funcs.getIndexInfo = (cb) => {
                 let options = {
                     where: {
                         userId: userId,
                         isDeleted: 0
                     },
                     include: [{
                         model: models[constants.MODELS.JF_MULTIPLIER_INFO],
                         as: 'multiplierInfo'
                     }]
                 };

                 models[constants.MODELS.JF_INDEX_INFO].findOne(options).then(data => {
                     if (data != null) {
                         cb(null, data.dataValues);
                         return;
                     }
                     cb(null, false);
                 }, err => {
                     cb(err);
                 });
             }

             funcs.processIndexCalculation = (getIndexInfo, cb) => {
                 if (getIndexInfo == false) {
                     cb(null, false);
                     return;
                 }
                 getIndexInfo.multiplierInfo = getIndexInfo.multiplierInfo.dataValues;
                 let multiplier = JFIndexCalculater.getMultiplicationFactor(getIndexInfo.multiplierInfo);
                 let JFI = JFIndexCalculater.getJFIndexAverage(getIndexInfo);
                 let JFIM = multiplier * JFI;

                 let query = {
                     jfIndex: JFI,
                     jfMultiplier: multiplier,
                     rateOfChange: 0.0
                 }
                 let options = {
                     where: {
                         userId: userId
                     }
                 }
                 models[constants.MODELS.JF_INDEX_MULTIPLIER].update(query, options).then(data => {

                 }, err => {

                 });
                 cb(null, true);
             }

             async.autoInject(funcs, (err, results) => {
                 if (err) {
                     console.log(err.message);
                 }
             });*/

    }

    /**
     * Increment the count of ratings requested
     * and updates the time of last rating requested
     * @param {*} userId | user id
     */
    static incrementRatingRequest(userId) {
        let options = {
            where: {
                userId: userId
            }
        }

        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('ratingsRequested', options);

        let query = {
            lastRatingRequested: TimeUtililty.currentTimeUTC()
        }

        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options)
                .then(flag => {

                })
                .catch(err => {

                });
    }

    /**
     * Updates the info if user change his profile public private settings
     * @param {*} userId
     * @param {*} privacyFlag
     */
    static updateUserProfilePrivacy(userId, privacyFlag) {
        let options = {
            where: {
                userId: userId
            }
        };

        let query = {
            isCaptainProfile: privacyFlag
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options).then(data => {
        }, err => {
        });
    }

    /**
     * Turns the flag high when ever user gives the anonymous feedback
     * @param {*} userId
     */
    static providedAnonymousRating(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        let query = {
            anonymousRatingGiven: true
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options).then(data => {
        }, err => {
        });
    }

    /**
     * Toggles the state when use change the settings of anonymous rating acceptance
     * @param {*} userId
     * @param {*} anonymousRatingAcceptanceFlag
     */
    static updateAnonymousRatingAcceptance(userId, anonymousRatingAcceptanceFlag) {
        let options = {
            where: {
                userId: userId
            }
        };

        let query = {
            acceptAnonymousFeedback: anonymousRatingAcceptanceFlag
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options).then(data => {
        }, err => {
        });
    }

    /**
     * Increment the people invited when ever user joins
     * @param {*} userIds
     */
    static incrementPeopleInvited(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('peopleInvited', options).then(data => {
        }, err => {
        });
    }

    /**
     * Increments the rating given and the last rating given when user gives the rating to someone
     * @param {*} userId
     */
    static incrementRatingGiven(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('ratingsGiven', options).then(data => {
        }, err => {
        });

        let query = {
            lastRatingGiven: TimeUtililty.currentTimeUTC()
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options).then(data => {
        }, err => {
        });
    }

    /**
     * Increment the follower or connection, when you friend someone or someone follows you
     * @param {*} userId
     */
    static incrementFollowerOrConnection(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('followers', options).then(data => {
        }, err => {
        });
    }

    static decrementFollowerOrConnection(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].decrement('followers', options).then(data => {
        }, err => {
        });
    }

    /**
     * Increments the counter when the user receives the rating
     * @param {*} userId
     */
    static incrementRatingRecieved(userId) {
        let options = {
            where: {
                userId: userId
            }
        };

        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('ratingsReceived', options).then(data => {
        }, err => {
        });
        ;
    }

    /**
     * Update the user last activity Time
     * @param {*} userId
     */
    static updateLastActivityTime(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        let query = {
            lastActivityTime: TimeUtililty.currentTimeUTC()
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].update(query, options).then(data => {
        }, err => {
        });
        ;
    }

    static incrementLoginDays(userId) {
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_MULTIPLIER_INFO].increment('loginDays', options).then(data => {
        }, err => {
        });
        JFIndexController.updateLastActivityTime(userId);
    }

    static updateLoginDays(userId) {
        let options = {
            where: {
                userId: userId,
                isDeleted: 0
            },
            attributes: ['lastActivityTime']
        }
        models[constants.MODELS.JF_MULTIPLIER_INFO].findOne(options).then(data => {
            if (TimeUtililty.isTodayDate(data.dataValues.lastActivityTime)==false) {
                // in the different date so increment login days and also update last activity time
                JFIndexController.incrementLoginDays(userId); // this functions automatically update last activity time
            } else {
                // in the same date, date change matters time change does not matter so no need to update time. if required un-comment the line below
                //JFIndexController.updateLastActivityTime(userId);
            }
            return null;
        }, err => {
        }).catch(err => {
        });
    }


    static _getRatingAverage(traitRating) {
        if (traitRating!=null && traitRating.length > 0) {
            let total = 0;
            for (let i = 0; i < traitRating.length; i++) {
                total += traitRating[i];
            }
            return total / traitRating.length;
        } else {
            return false;
        }
    }

    static _getRatingAverageFromDbObj(dbObj) {
        let output = {};

        let traitAppearanceCount = 0;
        let traitIntelligenceCount = 0;
        let traitPersonalityCount = 0;

        let traitAppearanceSum = 0;
        let traitIntelligenceSum = 0;
        let traitPersonalitySum = 0;

        traitAppearanceSum += (dbObj.trait1==null) ? 0:dbObj.trait1;
        traitAppearanceSum += (dbObj.trait2==null) ? 0:dbObj.trait2;
        traitAppearanceSum += (dbObj.trait3==null) ? 0:dbObj.trait3;

        traitAppearanceCount += (dbObj.trait1==null) ? 0:1;
        traitAppearanceCount += (dbObj.trait2==null) ? 0:1;
        traitAppearanceCount += (dbObj.trait3==null) ? 0:1;

        traitIntelligenceSum += (dbObj.trait4==null) ? 0:dbObj.trait4;
        traitIntelligenceSum += (dbObj.trait5==null) ? 0:dbObj.trait5;
        traitIntelligenceSum += (dbObj.trait6==null) ? 0:dbObj.trait6;

        traitIntelligenceCount += (dbObj.trait4==null) ? 0:1;
        traitIntelligenceCount += (dbObj.trait5==null) ? 0:1;
        traitIntelligenceCount += (dbObj.trait6==null) ? 0:1;

        traitPersonalitySum += (dbObj.trait7==null) ? 0:dbObj.trait7;
        traitPersonalitySum += (dbObj.trait8==null) ? 0:dbObj.trait8;
        traitPersonalitySum += (dbObj.trait9==null) ? 0:dbObj.trait9;

        traitPersonalityCount += (dbObj.trait7==null) ? 0:1;
        traitPersonalityCount += (dbObj.trait8==null) ? 0:1;
        traitPersonalityCount += (dbObj.trait9==null) ? 0:1;

        output.traitAppearance = (traitAppearanceCount==0) ? 0:traitAppearanceSum / traitAppearanceCount;
        output.traitIntelligence = (traitIntelligenceCount==0) ? 0:traitIntelligenceSum / traitIntelligenceCount;
        output.traitPersonality = (traitPersonalityCount==0) ? 0:traitPersonalitySum / traitPersonalityCount;

        return output;
    }

    static updateTraitRatings(userId, traitAppearanceRating, traitPersonalityRating, traitIntelligenceRating, previousRatingsIfAny, noPreviousRatingExists, getUserSettingsAndRelations) {

        let previousRating = {};

        if (noPreviousRatingExists!=true) {
            previousRating = JFIndexController._getRatingAverageFromDbObj(previousRatingsIfAny);
        }

        let options = {
            where: {
                userId: userId,
                isDeleted: 0,
            }
        };
        models[constants.MODELS.JF_INDEX_INFO].findOne(options).then(data => {
            if (data.dataValues!=null) {
                let existingValues = data.dataValues;
                let query = {
                    traitAppearanceAverage: existingValues.traitAppearanceAverage,
                    traitAppearanceTotal: existingValues.traitAppearanceTotal,
                    traitAppearanceCount: existingValues.traitAppearanceCount,

                    traitPersonalityAverage: existingValues.traitPersonalityAverage,
                    traitPersonalityTotal: existingValues.traitPersonalityTotal,
                    traitPersonalityCount: existingValues.traitPersonalityCount,

                    traitIntelligenceAverage: existingValues.traitIntelligenceAverage,
                    traitIntelligenceTotal: existingValues.traitIntelligenceTotal,
                    traitIntelligenceCount: existingValues.traitIntelligenceCount,

                }
                let options = {
                    where: {
                        userId: userId
                    }
                }

                const traitAppearanceAverage = JFIndexController._getRatingAverage(traitAppearanceRating);
                const traitIntelligenceAverage = JFIndexController._getRatingAverage(traitIntelligenceRating);
                const traitPersonalityAverage = JFIndexController._getRatingAverage(traitPersonalityRating);

                if (traitAppearanceAverage!=false) {
                    query.traitAppearanceTotal += traitAppearanceAverage;
                    query.traitAppearanceCount += 1;
                    query.traitAppearanceAverage = query.traitAppearanceTotal / query.traitAppearanceCount;
                }


                if (traitIntelligenceAverage!=false) {
                    query.traitIntelligenceTotal += traitIntelligenceAverage;
                    query.traitIntelligenceCount += 1;
                    query.traitIntelligenceAverage = query.traitIntelligenceTotal / query.traitIntelligenceCount;
                }

                if (traitPersonalityAverage!=false) {
                    query.traitPersonalityTotal += traitPersonalityAverage;
                    query.traitPersonalityCount += 1;
                    query.traitPersonalityAverage = query.traitPersonalityTotal / query.traitPersonalityCount;
                }

                if (noPreviousRatingExists!=true) {
                    if (getUserSettingsAndRelations.traitAppearance==true) {
                        query.traitAppearanceTotal -= previousRating.traitAppearance;
                        query.traitAppearanceTotal = (query.traitAppearanceTotal < 0) ? 0:query.traitAppearanceTotal;
                        query.traitAppearanceCount -= (previousRating.traitAppearance > 0) ? 1:0;
                        query.traitAppearanceAverage = (query.traitAppearanceCount==0) ? 0:(query.traitAppearanceTotal / query.traitAppearanceCount);
                    }

                    if (getUserSettingsAndRelations.traitIntelligence==true) {
                        query.traitIntelligenceTotal -= previousRating.traitIntelligence;
                        query.traitIntelligenceTotal = (query.traitIntelligenceTotal < 0) ? 0:query.traitIntelligenceTotal;
                        query.traitIntelligenceCount -= (previousRating.traitIntelligence > 0) ? 1:0;
                        query.traitIntelligenceAverage = (query.traitIntelligenceCount==0) ? 0:(query.traitIntelligenceTotal / query.traitIntelligenceCount);
                    }

                    if (getUserSettingsAndRelations.traitPersonality==true) {
                        query.traitPersonalityTotal -= previousRating.traitPersonality;
                        query.traitPersonalityTotal = (query.traitPersonalityTotal < 0) ? 0:query.traitPersonalityTotal;
                        query.traitPersonalityCount -= (previousRating.traitPersonality > 0) ? 1:0;
                        ;
                        query.traitPersonalityAverage = (query.traitPersonalityCount==0) ? 0:(query.traitPersonalityTotal / query.traitPersonalityCount);
                    }
                }

                models[constants.MODELS.JF_INDEX_INFO].update(query, options).then(data => {
                    JFIndexController.updateJFIndexUser(userId);
                    return null;
                }, err => {
                });
            }

        }, err => {

        });
    }

    static _makeArray(input, colName = 'id') {
        let output = [];
        for (let temp in input) {
            output.push(input[temp][colName]);
        }
        return output;
    }

    static _makeDummyDailyDataQuery(userId, date, appearanceAverageFlag, intelligenceAverageFlag, personalityAverageFlag) {
        let obj = {
            userId: userId,
            jfMultiplier: (Math.random() * 1.5) + 1,
            appearanceAverage: Math.floor((Math.random() * 21) + 1),
            personalityAverage: Math.floor((Math.random() * 21) + 1),
            intelligenceAverage: Math.floor((Math.random() * 21) + 1),
            status: 1,
            isDeleted: 0,
            processingTime: date
        };

        if (appearanceAverageFlag==false) {
            obj.appearanceAverage = 0;
        }
        if (intelligenceAverageFlag==false) {
            obj.intelligenceAverage = 0;
        }
        if (personalityAverageFlag==false) {
            obj.personalityAverage = 0;
        }


        obj.jfIndex = obj.appearanceAverage + obj.intelligenceAverage + obj.personalityAverage;


        let query = `INSERT into ${constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_DAILY} 
        (userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, processingTime)
        values (${obj.userId},${obj.jfIndex},${obj.jfMultiplier},${obj.appearanceAverage},${obj.intelligenceAverage},${obj.personalityAverage},'${obj.processingTime}');
        `;
        return query;
    }

    static _makeDummyDailyDataForYear(userId, startDate, endDate, appearanceAverageFlag, intelligenceAverageFlag, personalityAverageFlag) {
        let query = ``;
        for (let i = endDate; i >= startDate; i--) {
            query = query + JFIndexController._makeDummyDailyDataQuery(userId, TimeUtililty.getPreviousDateTime(i).toISOString().replace(/T/, ' ').replace(/\..+/, ''), appearanceAverageFlag, intelligenceAverageFlag, personalityAverageFlag);
        }
        return models.sequelize.query(query);
    }

    static makeDummyDailyDataForYear(request, reply) {
        let payload = request.payload;
        JFIndexController._makeDummyDailyDataForYear(payload.userId, payload.startDate, payload.endDate, payload.appearanceAverageFlag, payload.intelligenceAverageFlag, payload.personalityAverageFlag).then(data => {
            reply(ResponseUtility.makeResponseMessage(200, 'Successfully processed', true));
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static _updateJFIndexAndMakeHistoryData(userId, date, cb) {
        JFIndexController.updateJFIndexUser(userId, (err, data) => {
            if (err) {
                cb(err);
                return;
            }
            let query = `INSERT into ${constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_DAILY} (userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, processingTime, createdAt, updatedAt)
            select userId, jfIndex, jfMultiplier, appearanceAverage, intelligenceAverage, personalityAverage, '${date.toISOString().replace(/\..+/, '')}' ,'${TimeUtililty.currentTimeUTC()}', '${TimeUtililty.currentTimeUTC()}' from ${constants.MODELS.JF_INDEX_MULTIPLIER} where isDeleted = 0 and userId =${userId}`;
            models.sequelize.query(query).then(response => {
                cb(null, response);
            }, cb);
        });
    }

    static updateJFIndexAndMakeHistoryData(request, reply) {
        JFIndexController._updateJFIndexAndMakeHistoryData(request.payload.userId, request.payload.date, (err, response) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                reply(ResponseUtility.makeResponseMessage(200, 'Data processed Successfully', true));
            }
        });
    }
}
