'use strict';

const BaseController = require('./base_controller');
const UploadController = require('./upload_controller');
const JFIndexController = require('./jf_index_controller');
const ResponseUtility = require('../utilities/responseHandling');
const QueryUtility = require('../utilities/query');
const ErrorUtility = require('../utilities/errorHandling');
const PaginationUtility = require('../utilities/pagination');
const constants = require('../constants/constants');
const async = require('async');
const models = require('../models');
const Op = models.Sequelize.Op;

module.exports = class UserSettingsController extends BaseController {

    static updateNotificationSettings(request, reply) {
        UserSettingsController.generalToggleFunction('notificationsEnabled', request.payload.enableNotification, request.decoded.id, reply);
    }

    static updateLocationSettings(request, reply) {
        UserSettingsController.generalToggleFunction('locationEnabled', request.payload.enableLocation, request.decoded.id, reply);
    }

    static updateProfilePrivacy(request, reply) {
        //JFINDEX_POINTER: This settings effects the JFINDEX,
        UserSettingsController.generalToggleFunction('isCaptainProfile', request.payload.isCaptainProfile, request.decoded.id, reply);
        JFIndexController.updateUserProfilePrivacy(request.decoded.id, request.payload.isCaptainProfile);
    }

    static updateFbLinkVisibility(request, reply) {
        UserSettingsController.generalToggleFunction('displayFacebookProfile', request.payload.makeFbLinkVisible, request.decoded.id, reply);
    }

    static connectWithFacebook(request, reply) {
        const funcs = {};

        funcs.noUserExists = function (cb) {
            if (request.payload.flag==false) {
                cb(null, true);
                return;
            } else {
                models[constants.MODELS.JF_USERS].findOne({
                    where: {
                        facebookId: request.payload.facebookId,
                        status: 1,
                        isDeleted: 0,
                        id: {
                            [Op.ne]: request.decoded.id
                        }
                    }
                }).then(
                        (data) => {
                            cb(null, data==null); // we want to return true if there is no user
                        },
                        (err) => {
                            cb(err);
                        });
            }
        };

        funcs.connect = function (noUserExists, cb) {
            if (noUserExists==false) {
                cb(null, false);
                return;
            }
            if (request.payload.flag==true) {
                let userQuery = {
                    facebookId: request.payload.facebookId,
                    fbProfileLink: request.payload.fbProfileLink
                };
                let userOptions = {
                    where: {
                        id: request.decoded.id
                    }
                };
                models[constants.MODELS.JF_USERS].update(userQuery, userOptions);
            }
            UserSettingsController.generalToggleFunction('facebookConnected', request.payload.flag, request.decoded.id, reply);
            cb(null, true);
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code explainable.
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.noUserExists==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.EXISTS, constants.MESSAGES.DUPLICATE_USER, false));
            }
        });

    }


    static updateRatingsAcceptance(request, reply) {
        // if accept ratings is turned on or turned off
        // accept anonymous ratings will be turned on or off respecitvely
        // all three traits will be turned on or off respectively
        const funcs = {};
        funcs.userExistingSettings = (cb) => {
            let query = {
                attributes: ['traitAppearance', 'traitPersonality', 'traitIntelligence'],
                where: {
                    userId: request.decoded.id
                }
            };
            models[constants.MODELS.JF_USERS_SETTINGS].findOne(query).then(data => {
                cb(null, data.toJSON());
            }, cb);
        };
        funcs.updateAcceptRatings = function (cb) {
            let query = {
                acceptRating: request.payload.acceptRatings,
                acceptAnonymousRating: request.payload.acceptAnonymousRatings,
                traitAppearance: request.payload.traitAppearance,
                traitPersonality: request.payload.traitPersonality,
                traitIntelligence: request.payload.traitIntelligence
            };
            let options = {
                where: {
                    userId: request.decoded.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS_SETTINGS, query, options, null, null, null, cb);
            //JFINDEX_POINTER: This settings effects the JFINDEX,
            JFIndexController.updateAnonymousRatingAcceptance(request.decoded.id, request.payload.acceptAnonymousRatings);
        };

        funcs.updateTraitValues = (updateAcceptRatings, userExistingSettings, cb) => {
            let promises = [];
            if (userExistingSettings.traitAppearance==true && request.payload.traitAppearance==false) {
                let tempPromise = UserSettingsController._makeBackupOfTraitRatings('traitAppearance', request.decoded.id);
                promises.push(tempPromise);
            } else if (userExistingSettings.traitAppearance==false && request.payload.traitAppearance==true) {
                let tempPromise = UserSettingsController._recoverBackupOfTraitRatings('traitAppearance', request.decoded.id);
                promises.push(tempPromise);
            }

            if (userExistingSettings.traitIntelligence==true && request.payload.traitIntelligence==false) {
                let tempPromise = UserSettingsController._makeBackupOfTraitRatings('traitIntelligence', request.decoded.id);
                promises.push(tempPromise);
            } else if (userExistingSettings.traitIntelligence==false && request.payload.traitIntelligence==true) {
                let tempPromise = UserSettingsController._recoverBackupOfTraitRatings('traitIntelligence', request.decoded.id);
                promises.push(tempPromise);
            }

            if (userExistingSettings.traitPersonality==true && request.payload.traitPersonality==false) {
                let tempPromise = UserSettingsController._makeBackupOfTraitRatings('traitPersonality', request.decoded.id);
                promises.push(tempPromise);
            } else if (userExistingSettings.traitPersonality==false && request.payload.traitPersonality==true) {
                let tempPromise = UserSettingsController._recoverBackupOfTraitRatings('traitPersonality', request.decoded.id);
                promises.push(tempPromise);
            }

            Promise.all(promises).then(responses => {
                JFIndexController.updateJFIndexUser(request.decoded.id);
                cb(null, true);
            }, cb);
        };

        async.autoInject(funcs, (err, results) => {
            if (err) {
                ErrorUtility.makeError(err);
            } else {
                reply(ResponseUtility.makeSuccessfullUpdationMessage());
            }
        });
    }

    static updateAcceptRatings(request, reply) {
        UserSettingsController.generalToggleFunction('acceptRating', request.payload.acceptRatings, request.decoded.id, reply);
    }

    static updateAcceptAnonymousRatings(request, reply) {
        //JFINDEX_POINTER: This settings effects the JFINDEX,
        UserSettingsController.generalToggleFunction('acceptAnonymousRating', request.payload.acceptAnonymousRatings, request.decoded.id, reply);
        JFIndexController.updateAnonymousRatingAcceptance(request.decoded.id, request.payload.acceptAnonymousRatings);
    }

    static updateTraitAppearance(request, reply) {
        //JFINDEX_POINTER: This settings effects the JFINDEX,
        UserSettingsController.generalToggleFunction('traitAppearance', request.payload.acceptAppearanceRatings, request.decoded.id, reply);
    }

    static _makeBackupOfTraitRatings(trait, userId) {
        let query = {
            [`${trait}AverageBk`]: models.sequelize.col(`${trait}Average`),
            [`${trait}TotalBk`]: models.sequelize.col(`${trait}Total`),
            [`${trait}Average`]: 0,
            [`${trait}Total`]: 0
        };
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_INDEX_INFO].update(query, options);
    }

    static _recoverBackupOfTraitRatings(trait, userId) {
        let query = {
            [`${trait}Average`]: models.sequelize.col(`${trait}AverageBk`),
            [`${trait}Total`]: models.sequelize.col(`${trait}TotalBk`)
        };
        let options = {
            where: {
                userId: userId
            }
        };
        models[constants.MODELS.JF_INDEX_INFO].update(query, options);
    }

    static updateTraitPersonality(request, reply) {
        //JFINDEX_POINTER: This settings effects the JFINDEX,
        UserSettingsController.generalToggleFunction('traitPersonality', request.payload.acceptPersonalityRatings, request.decoded.id, reply);
    }

    static updateTraitIntelligence(request, reply) {
        //JFINDEX_POINTER: This settings effects the JFINDEX,
        UserSettingsController.generalToggleFunction('traitIntelligence', request.payload.acceptIntelligenceRatings, request.decoded.id, reply);
    }

    /**
     * A function for boolean settings toggle
     * @param {*} attributeName
     * @param {*} attributeValue
     * @param {*} userId
     * @param {*} reply
     */
    static generalToggleFunction(attributeName, attributeValue, userId, reply) {
        const query = {
            [attributeName]: attributeValue
        };

        const options = {
            where: {
                userId: userId
            }
        };

        QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS_SETTINGS, query, options, reply);
    }

    /**
     * Returns the user settings
     * @param {*} request
     * @param {*} reply
     */
    static getUserSettings(request, reply) {

        let options = {
            where: {
                userId: request.decoded.id,
            },
            attributes: {
                exclude: ['status', 'isDeleted', 'createdAt', 'updatedAt']
            }
        };

        QueryUtility.applyFindOneQuery(constants.MODELS.JF_USERS_SETTINGS, options, reply, null, false, null);
    }

    static unblock(request, reply) {

        const funcs = {};

        funcs.userExists = function (cb) {

            let options = {
                where: {
                    id: request.payload.blockUserId,
                    isDeleted: 0,
                    status: 1
                }
            };

            models[constants.MODELS.JF_USERS].count(options)
                    .then(count => {
                        if (count > 0) {
                            cb(null, true);
                            return;
                        }
                        cb(null, false);
                    }).catch(err => {
                cb(err);
            });
        };

        funcs.isUserBlocked = function (userExists, cb) {
            if (userExists==false) {
                cb(null, false);
                return;
            }

            let options = {
                where: {
                    userId: request.decoded.id,
                    reportUserId: request.payload.blockUserId,
                    isDeleted: 0,
                    status: 1
                }
            };

            models[constants.MODELS.JF_REPORT_USERS].count(options)
                    .then((count) => {
                        if (count > 0) {
                            cb(null, true);
                            return;
                        }
                        cb(null, false);
                    }).catch(err => {
                cb(err);
            });
        };

        funcs.unblockUser = function (isUserBlocked, cb) {

            if (isUserBlocked==false) {
                cb(null, false);
                return;
            }

            let query = {
                isDeleted: 1
            };

            let options = {
                where: {
                    userId: request.decoded.id,
                    reportUserId: request.payload.blockUserId,
                    status: 1
                }
            };

            models[constants.MODELS.JF_REPORT_USERS].update(query, options)
                    .then((data) => {
                        if (data) {
                            cb(null, true);
                            return;
                        }
                        cb(null, false);
                    }).catch(err => {
                cb(err);
            });
        };

        async.autoInject(funcs, function (err, results) {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.userExists==false || results.userExists==0) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.NOT_EXISTS, constants.MESSAGES.INVALID_ID_NOUSER, false));
            } else if (results.isUserBlocked==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, 'This user is not blocked by you.', false));
            } else if (results.unblockUser==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, 'Something went wrong', false));
            } else {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.UNBLOCK_USER_SUCCESSFUL, true));
            }
        });
    }

    static blockedUsers(request, reply) {

        const offset = PaginationUtility.getOffset(request.query.page, request.query.limit);

        let options = {
            attributes: ['id', 'userId', 'reportUserId'],
            where: {
                userId: request.decoded.id,
                isDeleted: 0
            },
            include: [{
                model: models['jf_users'],
                as: 'reportedUserRelation',
                where: {
                    status: 1,
                    isDeleted: 0
                },
                include: [{
                    model: models['jf_users_settings'],
                    as: 'settings',
                    attributes: ['isCaptainProfile', 'acceptRating']
                },
                    {
                        model: models['jf_index_multiplier'],
                        as: 'indexMultiplier',
                        attributes: ['jfIndex', 'jfMultiplier', 'rateOfChange']
                    },
                ],
                attributes: ['id', 'firstName', 'lastName', 'image'],
            },],
        };

        options.offset = offset;
        options.limit = request.query.limit;

        models[constants.MODELS.JF_REPORT_USERS].findAndCountAll(options)
                .then(data => {
                    PaginationUtility.sendPaginationReply(reply, data);
                }).catch(err => {
            ErrorUtility.makePaginatedError(reply, err);
        });
    }

    static block(request, reply) {

        const funcs = {};

        funcs.userExists = (cb) => {
            let options = {
                where: {
                    id: request.payload.targetUserId,
                    isDeleted: 0,
                    status: 1
                }
            };

            models[constants.MODELS.JF_USERS].count(options)
                    .then(count => {
                        if (count > 0) {
                            cb(null, true);
                            return;
                        }
                        cb(null, false);
                    }, err => {
                        cb(err);
                    });
        };

        funcs.isUserNotBlockedAlready = (userExists, cb) => {
            if (userExists==false) {
                cb(null, false);
                return;
            }

            let options = {
                where: {
                    userId: request.decoded.id,
                    reportUserId: request.payload.targetUserId,
                    isDeleted: 0,
                    status: 1
                }
            };

            models[constants.MODELS.JF_REPORT_USERS].count(options)
                    .then((count) => {
                        if (count > 0) {
                            cb(null, false);
                            return;
                        }
                        cb(null, true);
                    }, err => {
                        cb(err);
                    });
        };

        funcs.blockUser = (isUserNotBlockedAlready, cb) => {
            if (isUserNotBlockedAlready==false) {
                cb(null, false);
                return;
            }

            let query = {
                userId: request.decoded.id,
                reportUserId: request.payload.targetUserId,
            };

            models[constants.MODELS.JF_REPORT_USERS].create(query)
                    .then((data) => {
                        if (data) {
                            cb(null, true);
                            return;
                        }
                        cb(null, false);
                    }, err => {
                        cb(err);
                    });
        };

        // Remove all following and follower relations
        funcs.removeFollowingRelation = (blockUser, cb) => {
            if (blockUser==false) {
                cb(null, false);
                return;
            }
            const query = {
                isDeleted: 1
            };
            const options = {
                where: {
                    acceptRequest: true,
                    userId: request.payload.targetUserId,
                    friendUserId: request.decoded.id,
                    isDeleted: 0
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_FRIENDS, query, options, null, null, false, cb);
        };

        funcs.removeFollowerRelation = (blockUser, cb) => {
            if (blockUser==false) {
                cb(null, false);
                return;
            }
            const query = {
                isDeleted: 1
            };
            const options = {
                where: {
                    acceptRequest: true,
                    userId: request.decoded.id,
                    friendUserId: request.payload.targetUserId,
                    isDeleted: 0
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_FRIENDS, query, options, null, null, false, cb);
        };

        async.autoInject(funcs, function (err, results) {
            if (err) {
                reply(ErrorUtility.makeError(err));
                return;
            } else if (results.userExists==false || results.userExists==0) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.NOT_EXISTS, constants.MESSAGES.INVALID_ID_NOUSER, false));
            } else if (results.isUserNotBlockedAlready==false) {
                reply(ResponseUtility.makeResponseMessage(1000, constants.MESSAGES.TARGET_BLOCKED_ALREADY, false));
            } else if (results.blockUser==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, 'Something went wrong', false));
            } else {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.BLOCK_USER_SUCCESSFUL, true));
            }
        });
    }

    static deleteAccount(request, reply) {

        const funcs = {};
        funcs.removeProfileImage = (cb) => {
            let options = {
                where: {
                    id: request.decoded.id,
                    isDeleted: 0
                },
                attributes: ['image']
            };
            models[constants.MODELS.JF_USERS].findOne(options).then(data => {
                if (data==null) {
                    cb(null, false);
                    return;
                }
                UploadController.deleteProfileImage(data.dataValues.image, (err, data) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, data);
                });
            }, err => {
                cb(err);
            });

        };

        funcs.removeUserNotifications = (removeProfileImage, cb) => {
            if (removeProfileImage==false) {
                cb(null, false);
                return;
            }
            let options = {
                where: {
                    [Op.or]: {
                        userId: request.decoded.id,
                        fromUserId: request.decoded.id
                    }
                }
            };

            models[constants.MODELS.JF_NOTIFICATIONS].destroy(options)
                    .then((data) => {
                        cb(null, true);
                        return;
                    }).catch(err => {
                cb(err);
            });
        };

        funcs.RemoveFollowRequests = (removeProfileImage, cb) => {
            if (removeProfileImage==false) {
                cb(null, false);
                return;
            }
            let options = {
                where: {
                    [Op.or]: {
                        userId: request.decoded.id,
                        fromUserId: request.decoded.id
                    },
                    acceptRequest: {
                        [Op.or]: [0, null]
                    }
                }
            };

            models[constants.MODELS.JF_FOLLOWERS].destroy(options)
                    .then((data) => {
                        cb(null, true);
                        return;
                    }).catch(err => {
                cb(err);
            });
        };

        funcs.RemovePersonalInfoAndSoftDeleteAccount = (removeProfileImage, cb) => {
            if (removeProfileImage==false) {
                cb(null, false);
                return;
            }
            let query = {
                firstName: '',
                lastName: '',
                facebookId: '',
                email: '',
                password: '',
                image: '',
                gender: '',
                age: null,
                biography: '',
                location: '',
                longitude: null,
                latitude: null,
                authToken: '',
                deviceUid: '',
                deviceType: '',
                deviceToken: '',
                phoneNumber: '',
                resetCode: '',
                verificationCode: '',
                emailVerificationCode: '',
                isDeleted: 1
            };

            let options = {
                where: {
                    id: request.decoded.id
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, null, (data) => {
                cb(null, true);
            });
        };

        async.autoInject(funcs, (err, results) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.removeProfileImage==false) {
                reply(ResponseUtility.makeResponseMessage(404, constants.MESSAGES.INVALID_NOUSER, false));
            } else {
                reply(ResponseUtility.makeSuccessfullDeletionMessage());
            }
        });
    }

};
