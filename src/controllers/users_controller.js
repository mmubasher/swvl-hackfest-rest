'use strict';
const BaseController = require('./base_controller');
const JFIndexController = require('./jf_index_controller');
const QueryUtility = require('../utilities/query');
const EmailUtility = require('../utilities/email');
const ErrorUtility = require('../utilities/errorHandling');
const ResponseUtility = require('../utilities/responseHandling');
const TokenUtility = require('../utilities/token');
const AuthenticationUtility = require('../utilities/authentication');
const MobileDetect = require('mobile-detect');
const TimeUtility = require('../utilities/time');
const randomString = require('randomstring');
const responseCodes = require('../constants/response_codes');
const fs = require('fs');
const async = require('async');
const models = require('../models');
const constants = require('../constants/constants');
const Op = models.Sequelize.Op;

module.exports = class UsersController extends BaseController {
    static loginWithEmail(request, reply) {
        const funcs = {};
        funcs.userExists = function (cb) {
            UsersController._userExistsByEmail(request.payload.email, cb);
        };

        funcs.comparePassword = function (userExists, cb) {
            if (userExists==null || userExists.password==null) {
                cb(null, false);
                return;
            }
            AuthenticationUtility.comparePassword(request.payload.password, userExists.password, cb);
        };

        funcs.generateToken = function (userExists, comparePassword, cb) {
            if (userExists==null && comparePassword==false) {
                cb(null, false);
                return;
            }
            const token = TokenUtility.generateToken(userExists, 'user');
            cb(null, token);
        };

        funcs.saveToken = function (userExists, generateToken, cb) {
            if (generateToken==false) {
                cb(null, false);
                return;
            }
            const query = {
                authToken: generateToken,
                deviceUid: request.payload.deviceUid,
                deviceToken: request.payload.deviceToken,
                deviceType: request.payload.deviceType,
            };
            const options = {
                where: {
                    id: userExists.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing

            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_EMAIL_OR_PASSWORD, false));
            } else if (results.comparePassword==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_EMAIL_OR_PASSWORD, false));
            } else if (results.generateToken!=false && results.saveToken!=false) {
                const tokenToSend = UsersController._profileResponse(results.userExists, results.generateToken);
                reply(ResponseUtility.makeSuccessfullLoginMessage(tokenToSend, constants.MESSAGES.LOGIN_SUCCESSFULL));
            } else {
                reply('Internal Server Error while Login in').code(500);
            }
        });
    }

    static signupWithEmail(request, reply) {
        const funcs = {};

        funcs.userExists = function (cb) {
            UsersController._userExistsByEmail(request.payload.email, cb);
        };

        funcs.phoneNumberExists = function (userExists, cb) {
            if (userExists!=null) {
                cb(null, false);
                return;
            }
            cb(null, null);
            //UsersController._userExistsByPhone(request.payload.phoneNumber, cb);
        };

        funcs.addUser = function (phoneNumberExists, cb) {
            //usually false is for failure but phoneNumberExists flag is working opposite here            
            if (phoneNumberExists!=null) {
                cb(null, false);
                return;
            }

            const query = UsersController._makeAddUserByEmailQuery(request.payload);

            return models.sequelize.transaction().then(t => {
                const options = {
                    include: [{
                        model: models[constants.MODELS.JF_USERS_SETTINGS],
                        as: 'settings'
                    },
                        {
                            model: models[constants.MODELS.JF_INDEX_INFO],
                            as: 'indexInfo'
                        },
                        {
                            model: models[constants.MODELS.JF_MULTIPLIER_INFO],
                            as: 'multiplierInfo'
                        },
                        {
                            model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
                            as: 'indexMultiplier'
                        },
                        {
                            model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY],
                            as: 'initialHourlyData'
                        }
                    ],
                    transaction: t
                };
                QueryUtility.applyCreateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, result) => {
                    if (err) {
                        cb(err);
                        return t.rollback();
                    }
                    cb(err, result);
                    return t.commit();
                });
            }).catch(err => {
                cb(err);
            });

            // this should be a transaction as this is entering the record in two different tables

        };

        funcs.generateToken = function (addUser, cb) {
            if (addUser==false) {
                cb(null, false);
                return;
            }
            const token = TokenUtility.generateToken(addUser, 'user');
            cb(null, token);
        };

        funcs.saveToken = function (addUser, generateToken, cb) {
            if (generateToken==false) {
                cb(null, false);
                return;
            }

            const query = {
                authToken: generateToken,
            };
            const options = {
                where: {
                    id: addUser.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);

        };

        funcs.sendEmail = function (saveToken, addUser, cb) {
            if (saveToken==false || addUser==false) {
                cb(null, false);
                return;
            }
            //cb(null, true);
            EmailUtility.sendSignUpEmail(addUser,
                    (err, isSent) => {
                        if (err) {
                            cb(err);
                            return;
                        }
                        cb(null, isSent);
                    });
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code explainable.
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.userExists!=null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.EXISTS, constants.MESSAGES.DUPLICATE_EMAIL, false));
            } else if (results.phoneNumberExists!=null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.EXISTS, constants.MESSAGES.DUPLICATE_PHONE, false));
            } else if (results.generateToken!=false && results.saveToken!=false) {
                const tokenToSend = UsersController._profileResponse(results.addUser, results.generateToken);
                reply(ResponseUtility.makeSuccessfullLoginMessage(tokenToSend, constants.MESSAGES.SIGNUP_SUCCESSFULL));
            } else {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.SIGNUP_FAILED, constants.MESSAGES.UNKNOWN_FAILURE, false));
            }
        });
    }

    static logout(request, reply) {
        const query = {
            authToken: '',
            deviceToken: ''
        };
        const options = {
            where: {
                id: request.decoded.id
            }
        };
        QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, data) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                reply(ResponseUtility.makeResponseMessage(200, constants.MESSAGES.LOGOUT_SUCCESSFULL, true));
            }
        });
    }

    static updateProfilePicture(request, reply) {
        const query = {
            image: request.payload.image,
        };
        const options = {
            where: {
                id: request.decoded.id
            }
        };
        QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, data) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                reply(ResponseUtility.makeResponseMessage(200, constants.MESSAGES.UPDATION_SUCCESSFULL, true));
            }
        });
    }

    static emailExists(request, reply) {
        QueryUtility.getCount(request.payload.email, constants.MODELS.JF_USERS, 'email', (err, count) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                const response = {
                    isExists: (count!=0)
                };
                reply(ResponseUtility.makeSuccessfullDataMessage(response));
            }
        });
    }

    static phoneNumberExists(request, reply) {
        QueryUtility.getCount(request.payload.phoneNumber, constants.MODELS.JF_USERS, 'phoneNumber', (err, count) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                const response = {
                    isExists: (count!=0)
                };
                reply(ResponseUtility.makeSuccessfullDataMessage(response));
            }
        });
    }


    /**
     *
     * @param {*} request
     * @param {*} reply
     * Step 1: sends the forgot password email to the email id linked with the account
     */
    static forgotPassword(request, reply) {
        const funcs = {};
        funcs.userExists = function (cb) {
            UsersController._userExistsByEmail(request.payload.email, cb);
        };

        funcs.generateAndStoreCode = function (userExists, cb) {
            if (userExists==null) {
                cb(null, false);
                return;
            }

            const query = {
                resetCode: AuthenticationUtility.generateResetCode(),
            };
            const options = {
                where: {
                    id: userExists.id
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, data) => {
                userExists.resetCode = query.resetCode;
                cb(err, userExists);
            });
        };


        funcs.sendEmail = function (generateAndStoreCode, cb) {
            if (generateAndStoreCode==false) {
                cb(null, false);
                return;
            }
            EmailUtility.sendForgotPwdMail(generateAndStoreCode, cb);
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_EMAIL_NOUSER, false));
            } else if (results.generateAndStoreCode==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.CODE_GENERATION_FAILURE, false));
            } else if (results.sendEmail==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.EMAIL_FAILURE, false));
            } else if (results.sendEmail==true) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.EMAIL_SENT_SUCCESSFULLY, true));
            } else {
                reply(ResponseUtility.makeResponseMessage(501, 'Internal Server Error', false));
            }
        });
    }

    static redirectToResetPassword(request, reply) {


        const md = new MobileDetect(request.headers['user-agent']);
        QueryUtility.getCount(request.query.code, constants.MODELS.JF_USERS, 'resetCode', (err, count) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
                return;
            }
            if (count > 0) {
                if (md.mobile()) {
                    reply.redirect(`${constants.REDIRECTION_URLS_MOBILE.RESET_PASSWORD}code=${request.query.code}`);
                } else {
                    reply('Please open this link from device where JVSTFAMOVS is installed.');
                    const url = constants.CONFIGS.webUri + '/#/reset-password?code=' + request.query.code;
                    reply.redirect(url);
                }
            } else {
                if (md.mobile()) {
                    reply.redirect(constants.REDIRECTION_URLS_MOBILE.RESET_PASSWORD_INVALID_VERIFICATION_CODE);
                } else {
                    const url = constants.CONFIGS.webUri + '/#/reset-password-expired';
                    reply.redirect(url);
                }
            }
        });
    }

    static resetPassword(request, reply) {
        const funcs = {};

        funcs.userExists = function (cb) {
            UsersController._userExistsByX(request.payload.code, 'resetCode', cb);
        };

        funcs.updatePassword = function (userExists, cb) {
            if (userExists==null) {
                cb(null, false);
                return;
            }
            UsersController._updatePassword(userExists.id, request.payload.password, true, cb);
        };

        funcs.generateToken = function (updatePassword, userExists, cb) {
            if (updatePassword==false) {
                cb(null, false);
                return;
            }
            const token = TokenUtility.generateToken(userExists, 'user');
            cb(null, token);
        };

        funcs.saveToken = function (userExists, generateToken, cb) {
            if (generateToken==false) {
                cb(null, false);
                return;
            }
            const query = {
                authToken: generateToken,
                resetCode: '',
            };
            const options = {
                where: {
                    id: userExists.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);
        };

        funcs.sendEmail = function (saveToken, userExists, cb) {
            /*if (saveToken == false || userExists == false) {
                cb(null, false);
                return;
            }
            emailUtility.sendPwdChangedMail(userExists, "customers",
                (err, isSent) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, isSent);
                });*/
            cb(null, true);
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing

            if (err) {
                reply(ErrorUtility.makeError(err));
                return;
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_RESET_CODE, false));
                return;
            } else if (results.updatePassword==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.NEW_PASSWORD_FAILURE, false));
                return;
            } else if (results.userExists!=null && results.updatePassword!=false) {
                const tokenToSend = UsersController._profileResponse(results.userExists, results.generateToken);
                reply(ResponseUtility.makeSuccessfullDataMessage(tokenToSend, constants.MESSAGES.PASSWORD_RESET_SUCCESSFULL));
                return;
            } else {
                reply(ResponseUtility.makeResponseMessage(501, 'Internal Server Error', false));
                // will the code ever come here ? 
            }
        });
    }

    /**
     * A function that will change the user password, accepts oldPassword, and newPassword in the payload,
     * This function will expire the reset password
     * @param {*} request
     * @param {*} reply
     */
    static updatePassword(request, reply) {

        const funcs = {};

        funcs.userExists = function (cb) {
            UsersController._userExistsByID(request.decoded.id, cb);
        };

        funcs.comparePassword = function (userExists, cb) {
            if (userExists==null) {
                cb(null, false);
                return;
            }
            AuthenticationUtility.comparePassword(request.payload.oldPassword, userExists.password, cb);
        };

        funcs.updatePassword = function (userExists, comparePassword, cb) {
            if (comparePassword==false) {
                cb(null, false);
                return;
            }
            UsersController._updatePassword(userExists.id, request.payload.newPassword, false, cb);
        };

        funcs.generateToken = function (updatePassword, userExists, cb) {
            if (updatePassword==false) {
                cb(null, false);
                return;
            }
            const token = TokenUtility.generateToken(userExists, 'user');
            cb(null, token);
        };

        funcs.saveToken = function (userExists, generateToken, cb) {
            if (generateToken==false) {
                cb(null, false);
                return;
            }
            const query = {
                authToken: generateToken,
                resetCode: '',
            };
            const options = {
                where: {
                    id: userExists.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);
        };
        funcs.sendEmail = function (saveToken, userExists, cb) {
            /*if (saveToken == false || userExists == false) {
                cb(null, false);
                return;
            }
            emailUtility.sendPwdChangedMail(userExists, "customers",
                (err, isSent) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, isSent);
                });*/
            cb(null, true);
        };


        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing

            if (err) {
                reply(ErrorUtility.makeError(err));
                return;
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_NOUSER, false));
                return;
            } else if (results.comparePassword==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_CURRENT_PASSWORD, false));
                return;
            } else if (results.updatePassword==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.NEW_PASSWORD_FAILURE, false));
                return;
            } else if (results.userExists!=null && results.updatePassword!=false) {
                const tokenToSend = UsersController._profileResponse(results.userExists, results.generateToken);
                reply(ResponseUtility.makeSuccessfullLoginMessage(tokenToSend, constants.MESSAGES.PASSWORD_CHANGE_SUCCESSFULL));
                return;
            } else {
                reply(ResponseUtility.makeResponseMessage(501, 'Internal Server Error', false));
                // will the code ever come here ? 
            }
        });

    }

    static setPassword(request, reply) {

    }

    static hasPassword(request, reply) {

    }

    static getProfile(request, reply) {

        const options = UsersController._getProfileQuery();
        options.where.id = request.decoded.id;

        options.include.push({
            model: models[constants.MODELS.JF_MULTIPLIER_INFO],
            as: 'multiplierInfo',
            attributes: ['ratingsReceived', 'ratingsGiven', 'ratingsRequested']
        });

        QueryUtility.applyFindOneQuery('jf_users', options, null, null, false,
                (err, data) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }
                    // UsersController._profileResponse(data,null,true);
                    data.dataValues.isFacebookUser = (data.dataValues.password==null);
                    delete data.dataValues.password;
                    reply(ResponseUtility.makeSuccessfullDataMessage(data));
                });
    }

    /////////////////////////////////////////////////
    /////////////////////////////////////////////////
    /////////////// UTILITY FUNCTIONS ///////////////
    /////////////////////////////////////////////////
    /////////////////////////////////////////////////

    /**
     *  A function which makes a optimized query to get user profile, just update the where clause after this.
     */
    static _getProfileQuery() {
        const options = {
            where: {
                isDeleted: 0,
                status: 1
            },
            attributes: {
                exclude: ['isDeleted', 'status', 'verificationCode', 'resetCode', 'deviceUid', 'deviceType', 'deviceToken', 'age', 'gender']
            },
            include: [{
                model: models[constants.MODELS.JF_USERS_SETTINGS],
                as: 'settings',
                attributes: {
                    exclude: ['isDeleted', 'status']
                }
            }]
        };
        return options;
    }

    static _hasPassword(id) {

    }

    /**
     * @param {*} email
     * @param {*} cb
     *
     * Returns true or false, and a callbacks with first argument of the error
     */
    static _userExistsByEmail(email, cb) {
        models.jf_users.findOne({
            where: {
                email: email,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data);
                },
                (err) => {
                    cb(err);
                });
    }

    static _userExistsByPhone(phoneNumber, cb) {
        models.jf_users.findOne({
            where: {
                phoneNumber: phoneNumber,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data);
                },
                (err) => {
                    cb(err);
                });
    }

    static _userExistsByID(id, cb) {
        models.jf_users.findOne({
            where: {
                id: id,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data);
                },
                (err) => {
                    cb(err);
                });
    }

    static _userExistsByX(value, colName, cb) {
        models.jf_users.findOne({
            where: {
                [colName]: value,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data);
                },
                (err) => {
                    cb(err);
                });
    }

    /**
     *
     * @param {*} id | User id
     * @param {*} password | password to set
     * @param {*} resetCode | true if you want to make reset code non-function if any, by-default true
     * @param {*} cb | call back
     *
     */
    static _updatePassword(id, password, resetCode = true, cb) {
        const query = {
            password: AuthenticationUtility.encryptPassword(password),
            authToken: ''
        };
        if (resetCode==true) {
            query.resetCode = '';
        }
        const options = {
            where: {
                id: id
            }
        };
        QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);
    }


    /**
     * Returns true or false, and a callbacks with first argument of the error
     * @param {*} facebookId
     * @param {*} cb
     */
    static _userExistsByFacebookId(facebookId, cb) {
        models.jf_users.findOne({
            where: {
                facebookId: facebookId,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data); // we want to return true if there is no user
                },
                (err) => {
                    cb(err);
                });
    }

    /**
     * returns true or false
     * @param {*} email
     * @param {*} facebookId
     * @param {*} cb
     */
    static _userExistsByEmailOrFacebookId(email, facebookId, cb) {
        models.jf_users.findOne({
            where: {
                [Op.or]: {
                    facebookId: facebookId,
                    email: email
                },
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data); // we want to return true if there is no user
                },
                (err) => {
                    cb(err);
                });
    }

    /**
     *
     * @param {*} payload
     * Helper function to make the add user query, to make the code more readable
     */
    static _makeAddUserByEmailQuery(payload) {
        return UsersController._makeAddUserQuery(payload, 1);
    }

    /**
     *
     * @param {*} payload
     * Helper function to make the add user query, to make the code more readable
     */
    static _makeAddUserByFacebookQuery(payload) {
        return UsersController._makeAddUserQuery(payload, 2);
    }

    /**
     *
     * @param {*} payload
     * @param {*} type (1 for email, 2 for facebook)
     *
     */
    static _makeAddUserQuery(payload, type) {

        const query = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phoneNumber: payload.phoneNumber,
            image: payload.image,

            settings: {


                notificationsEnabled: payload.notificationsEnabled,
                locationEnabled: payload.locationEnabled,
                isCaptainProfile: payload.isCaptainProfile,

                //default
                //isCaptainProfile: constants.USER_DEFAULT_SETTINGS.PROFILE_IS_PUBLIC,
                //acceptRating: constants.USER_DEFAULT_SETTINGS.ACCEPT_RATINGS,
                //acceptAnonymousRating: constants.USER_DEFAULT_SETTINGS.ACCEPT_ANONYMOUS_RATINGS,
                displayFacebookProfile: constants.USER_DEFAULT_SETTINGS.DISPLAY_FACEBOOK_PROFILE,
            },

            indexInfo: {
                traitAppearanceAverage: 0,
                traitPersonalityAverage: 0,
                traitIntelligenceAverage: 0,

                traitAppearanceTotal: 0,
                traitPersonalityTotal: 0,
                traitIntelligenceTotal: 0,

                traitAppearanceCount: 0,
                traitPersonalityCount: 0,
                traitIntelligenceCount: 0,
            },

            multiplierInfo: {
                isCaptainProfile: payload.isCaptainProfile,
                anonymousRatingGiven: 0,
                acceptAnonymousFeedback: constants.USER_DEFAULT_SETTINGS.ACCEPT_ANONYMOUS_RATINGS,
                ratingsGiven: 0,
                ratingsReceived: 0,
                ratingsRequested: 0,
                peopleInvited: 0,
                followers: 0,
                lastActivityTime: TimeUtility.currentTimeUTC(),
                loginDays: 0,
                signupTime: TimeUtility.currentTimeUTC(),
            },

            indexMultiplier: {
                jfIndex: 0,
                jfMultiplier: 1,
                rateOfChange: 0.0,
                appearanceAverage: 0,
                intelligenceAverage: 0,
                personalityAverage: 0,
                appearanceRateOfChange: 0,
                intelligenceRateOfChange: 0,
                personalityRateOfChange: 0
            },

            initialHourlyData: {
                jfIndex: 0,
                jfMultiplier: 1,
                appearanceAverage: 0,
                intelligenceAverage: 0,
                personalityAverage: 0,
                processingTime: TimeUtility.currentTimeUTC()
            },

            deviceUid: payload.deviceUid,
            deviceToken: payload.deviceToken,
            deviceType: payload.deviceType,

            status: 1, //customerData.status,        
            isDeleted: 0,
        };

        if (payload.traitNone==true) {
            query.settings.traitAppearance = false;
            query.settings.traitPersonality = false;
            query.settings.traitIntelligence = false;
            query.settings.traitNone = true;
            query.settings.acceptRating = false;
            query.settings.acceptAnonymousRating = false;
        } else {
            query.settings.traitAppearance = payload.traitAppearance;
            query.settings.traitPersonality = payload.traitPersonality;
            query.settings.traitIntelligence = payload.traitIntelligence;
            query.settings.traitNone = false;
            query.settings.acceptRating = true;
            query.settings.acceptAnonymousRating = true;
        }

        if (type==1) { //Email
            query.password = AuthenticationUtility.encryptPassword(payload.password);
            query.settings.facebookConnected = 0;
        } else if (type==2) { //Facebook
            query.facebookId = payload.facebookId;
            query.fbProfileLink = payload.fbProfileLink;
            query.settings.facebookConnected = 1;
        }
        return query;
    }

    /**
     * A function to make the consistent reply on the login, signup etc.
     * @param {*} user | db object of the user
     * @param {*} token | can be null, but if the db do not have the token, you can send this using this parameter
     */
    static _profileResponse(user, token = null) {
        const tokenToSend = {
            'token': token,
            'id': user.id,

            'firstName': user.firstName,
            'lastName': user.lastName,

            'email': user.email,
            'facebookId': user.facebookId,
            'fbProfileLink': user.fbProfileLink,
            'isFacebookUser': user.password==null,
            'image': user.image
        };

        if (tokenToSend.token==null) {
            tokenToSend.token = customer.authToken;
        }
        return tokenToSend;
    }

    /**
     * Hard deletes the user from database
     *@param {*} request
     *@param {*} reply
     */
    static deleteUser(request, reply) {

        const funcs = {};

        funcs.userExists = function (cb) {
            UsersController._userExistsByPhone(request.payload.phoneNumber, cb);
        };

        funcs.deleteUser = function (userExists, cb) {
            if (userExists==null) {
                cb(null, false);
                return;
            }

            const query = {
                isDeleted: 1
            };
            let userOptions = {
                where: {
                    id: userExists.id
                }
            };

            let settingsOptions = {
                where: {
                    userId: userExists.id
                }
            };


            models[constants.MODELS.JF_USERS_SETTINGS].update(query, settingsOptions)
                    .then(data1 => {
                        models[constants.MODELS.JF_USERS].update(query, userOptions)
                                .then(data2 => {
                                    cb(null, true);
                                }).catch(err => {
                            cb(err);
                        });
                    }).catch(err => {
                cb(err);
            });


        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing

            if (err) {
                reply(ErrorUtility.makeError(err));
                return;
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_NOUSER, false));
                return;
            } else if (results.deleteUser==true) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.DELETION_SUCCESSFULL, true));
                return;
            }
        });
    }

    static updateProfile(request, reply) {

        const query = {
            firstName: request.payload.firstName,
            lastName: request.payload.lastName
        };

        if (request.payload.location!=null) {
            query.location = request.payload.location;
        }

        if (request.payload.biography!=null) {
            query.biography = request.payload.biography;
        }

        const options = {
            where: {
                id: request.decoded.id
            }
        };

        QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, data) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                reply(ResponseUtility.makeResponseMessage(200, constants.MESSAGES.UPDATION_SUCCESSFULL, true));
            }
        });
    }

    static updateEmail(request, reply) {

        const funcs = {};

        funcs.isEmailExists = function (cb) {
            const options = {
                where: {
                    email: request.payload.email,
                    isDeleted: 0,
                    status: 1
                }
            };

            models[constants.MODELS.JF_USERS].findOne(options)
                    .then(data => {
                                cb(null, data!=null); // we want to return false if there is no user
                            },
                            (err) => {
                                cb(err);
                            });
        };

        funcs.generateAndStoreCode = function (isEmailExists, cb) {
            if (isEmailExists==true) {
                cb(null, false);
                return;
            }
            const query = {
                emailVerificationCode: AuthenticationUtility.generateResetCode(),
            };
            const options = {
                where: {
                    id: request.decoded.id
                }
            };
            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, (err, data) => {
                // userExists.resetCode = query.emailResetCode;
                cb(err, data);
            });
        };

        funcs.getUser = function (isEmailExists, generateAndStoreCode, cb) {
            if (isEmailExists==true || generateAndStoreCode==false) {
                cb(null, false);
                return;
            }
            UsersController._userExistsByID(request.decoded.id, cb);
        };

        funcs.sendEmail = function (getUser, cb) {
            if (getUser==false) {
                cb(null, false);
                return;
            }
            getUser.requestedEmail = request.payload.email;
            EmailUtility.sendChangeEmailIdEmail(getUser, cb); //we need to send name/user profile as well
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.isEmailExists==true) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.EMAIL_ALREADY_IN_USE, false));
            } else if (results.generateAndStoreCode==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.CODE_GENERATION_FAILURE, false));
            } else if (results.sendEmail==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.EMAIL_FAILURE, false));
            } else if (results.sendEmail==true) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.EMAIL_CHANGE_CONFORMATION_SENT_SUCCESSFULLY, true));
            } else {
                reply(ResponseUtility.makeResponseMessage(501, 'Internal Server Error', false));
            }
        });

    }

    static redirectToUpdateEmail(request, reply) {
        const funcs = {};
        const md = new MobileDetect(request.headers['user-agent']);
        funcs.isVerificationCodeExist = function (cb) {
            UsersController._userExistsByX(request.query.code, 'emailVerificationCode', cb);
        };

        funcs.isEmailExist = function (isVerificationCodeExist, cb) {
            if (isVerificationCodeExist==null) {
                cb(null, false); // Send false if email exists
                return;
            }
            UsersController._userExistsByEmail(request.query.requestedEmail, cb);
        };

        funcs.updateEmail = function (isEmailExist, isVerificationCodeExist, cb) {
            if (isEmailExist!=null || isEmailExist==false) {
                cb(null, false);
                return;
            }
            const query = {
                email: request.query.requestedEmail,
                emailVerificationCode: ''
            };

            const options = {
                where: {
                    id: isVerificationCodeExist.id,
                    isDeleted: 0,
                    status: 1
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, true, cb);
        };

        async.autoInject(funcs, function (err, results) {

            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.isVerificationCodeExist==null) {
                /* if (md.mobile()) {
                    reply.redirect(constants.REDIRECTION_URLS_MOBILE.UPDATE_EMAIL_INVALID_VERIFICATION_CODE);
                } else {
                    reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_RESET_CODE, false));
                    //reply("The link has been expired or is invalid");
                } */
                reply(`<html> <head> </head> <body> <p style="font-size: 60px;">The link has been expired or is invalid.</p> </body> </html>`);
            } else if (results.isEmailExist!=null) {
                /* if (md.mobile()) {
                    reply.redirect(constants.REDIRECTION_URLS_MOBILE.UPDATE_EMAIL_INVALID_EMAIL);
                } else {
                    reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.EXISTS, constants.MESSAGES.EMAIL_ALREADY_IN_USE, false));
                } */
                reply(`<html> <head> </head> <body> <p style="font-size: 60px;"> The email is already in use, don't you think this is funny?</p> </body> </html>`);
            } else {
                reply(`<html> <head> </head> <body> <p style="font-size: 60px;">Your email has been updated successfully.</p> </body> </html>`);
                /*if (md.mobile()) {
                    reply.redirect(constants.REDIRECTION_URLS_MOBILE.UPDATE_EMAIL_SUCCESS);
                } else {
                    fs.readFile(`././src/views/email_updated_confirmation.html`, 'utf8',
                    (err, response) => {
                        if(err){
                            reply(ErrorUtility.makeError(err));
                            return;
                        }
                        reply(response);
                    });
                } */
            }
        });
    }

    static updatePhoneNumber(request, reply) {

        const funcs = {};

        funcs.isPhoneNumberExist = function (cb) {
            UsersController._userExistsByPhone(request.payload.phoneNumber, cb);
        };

        funcs.updatePhoneNumber = function (isPhoneNumberExist, cb) {

            if (isPhoneNumberExist!=null) {
                cb(null, false);
                return;
            }

            const query = {
                phoneNumber: request.payload.phoneNumber
            };

            const options = {
                where: {
                    id: request.decoded.id,
                    isDeleted: 0,
                    status: 1
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, false, cb);

            // models[constants.MODELS.JF_USERS].update(query, options)
            //     .then(data => {
            //         reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.OK, constants.MESSAGES.PHONE_NUMBER_CHANGED_SUCCESSFULLY, true));
            //     })
            //     .catch(err => {
            //         cb
            //     });
        };

        async.autoInject(funcs, function (err, results) {
            // return and if else both is used intentionally, to make the code readable., 
            // as it may be un-necessary but are not causing any extra processing

            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.isPhoneNumberExist!=null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.EXISTS, constants.MESSAGES.DUPLICATE_PHONE, false));
            } else if (results.updatePhoneNumber==false) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.UPDATE_ACTION_FAILURE, false));
            } else if (results.isPhoneNumberExist==null && results.updatePhoneNumber!=false) {
                reply(ResponseUtility.makeSuccessfullUpdationMessage(funcs.updatePhoneNumber, constants.MESSAGES.UPDATION_SUCCESSFULL));
            }
        });
    }

    /**
     * Return true or false, or err
     * @param {*} userId
     * @param {*} cb
     */
    static _userExists(userId, cb) {
        models[constants.MODELS.JF_USERS].findOne({
            where: {
                id: userId,
                status: 1,
                isDeleted: 0
            },
            attributes: ['id']
        }).then(
                (data) => {
                    cb(null, data!=null); // we want to return true if there is no user
                },
                (err) => {
                    cb(err);
                });
    }

    /**
     * Return userData
     * @param {*} userId
     * @param {*} cb
     */
    static _userExistsByData(userId, cb) {
        models[constants.MODELS.JF_USERS].findOne({
            where: {
                id: userId,
                status: 1,
                isDeleted: 0
            }
        }).then(
                (data) => {
                    cb(null, data); // we want to return true if there is no user
                },
                (err) => {
                    cb(err);
                });
    }

    /**
     * Verify password - Return true if matched and vice versa
     */
    static verifyPassword(request, reply) {

        const funcs = {};

        funcs.userExists = function (cb) {
            UsersController._userExistsByID(request.decoded.id, cb);
        };

        funcs.comparePassword = function (userExists, cb) {
            if (userExists==null || userExists.password==null) {
                cb(null, false);
                return;
            }
            AuthenticationUtility.comparePassword(request.payload.password, userExists.password, cb);
        };

        async.autoInject(funcs, (err, results) => {
            if (err) {
                ErrorUtility.makeError(err);
            } else if (results.userExists==null) {
                reply(ResponseUtility.makeResponseMessage(constants.RESPONSE_CODES.FAILED, constants.MESSAGES.INVALID_NOUSER, false));
            } else if (results.comparePassword==false) {
                let output = {};
                output.matched = false;
                reply(ResponseUtility.makeSuccessfullDataMessage(output));
            } else if (results.comparePassword==true) {
                let output = {};
                output.matched = true;
                reply(ResponseUtility.makeSuccessfullDataMessage(output));
            }
        });
    }

    /**
     * Updates location if location is enabled in settings
     */
    static updateLocation(request, reply) {

        const funcs = {};

        funcs.userExistswithSettings = (cb) => {
            models.jf_users.findOne({
                where: {
                    id: request.decoded.id,
                    status: 1,
                    isDeleted: 0
                },
                include: [{
                    model: models[constants.MODELS.JF_USERS_SETTINGS],
                    as: 'settings',
                    attributes: ['locationEnabled']
                }]
            }).then(
                    (data) => {
                        cb(null, data);
                    },
                    (err) => {
                        cb(err);
                    });
        };

        funcs.isLocationEnabled = (userExistswithSettings, cb) => {
            if (userExistswithSettings==null || userExistswithSettings.settings.locationEnabled==null ||
                    userExistswithSettings.settings.locationEnabled==false) {
                cb(null, false);
                return;
            }
            cb(null, true);
        };

        funcs.updateLocation = (isLocationEnabled, cb) => {
            if (isLocationEnabled==false) {
                cb(null, false);
                return;
            }

            let query = {
                longitude: request.payload.longitude,
                latitude: request.payload.latitude
            };
            let options = {
                where: {
                    id: request.decoded.id,
                    status: 1,
                    isDeleted: 0
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, null, cb);
        };

        async.autoInject(funcs, (err, results) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else if (results.isLocationEnabled==false) {
                reply(ResponseUtility.makeResponseMessage(100, 'Location is disabled. Please enable location in settings.', false));
            } else if (results.updateLocation==false) {
                reply(ResponseUtility.makeResponseMessage(101, 'Cannot update location. Something went wrong.', false));
            } else if (results.updateLocation==true) {
                reply(ResponseUtility.makeSuccessfullUpdationMessage());
            }
        });
    }

    static updateDeviceToken(request, reply) {

        const funcs = {};
        funcs.updateDeviceToken = (cb) => {
            let query = {
                deviceToken: request.payload.deviceToken,
            };
            let options = {
                where: {
                    id: request.decoded.id,
                    status: 1,
                    isDeleted: 0
                }
            };

            QueryUtility.applyUpdateQuery(constants.MODELS.JF_USERS, query, options, null, null, null, cb);
        };

        async.autoInject(funcs, (err, results) => {
            if (err) {
                reply(ErrorUtility.makeError(err));
            } else {
                reply(ResponseUtility.makeSuccessfullUpdationMessage());
            }
        });
    }

    static getMyGraph(request, reply) {
        UsersController.getGraphForUser(request.decoded.id).then(data => {
            if (data==null) {
                reply(ResponseUtility.makeResponseMessage(1000, 'No user exists with this Id.', false));
            } else {
                reply(ResponseUtility.makeSuccessfullDataMessage(data));
            }
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static getGraphForUser(request, reply) {
        UsersController._getGraphForUser(request.query.userId).then(data => {
            if (data==null) {
                reply(ResponseUtility.makeResponseMessage(1000, 'No user exists with this Id.', false));
            } else {
                data = data.toJSON();
                let currentDataPoint = {
                    id: 0,
                    jfIndex: data.jfIndex,
                    jfMultiplier: data.jfMultiplier,
                    appearanceAverage: data.appearanceAverage,
                    intelligenceAverage: data.intelligenceAverage,
                    personalityAverage: data.personalityAverage,
                    processingTime: new Date().toISOString()
                };

                data.graphData.push(currentDataPoint);
                reply(ResponseUtility.makeSuccessfullDataMessage(data));
            }
        }, err => {
            reply(ErrorUtility.makeError(err));
        }).catch(err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static getMyGraph(request, reply) {
        UsersController._getGraphForUser(request.decoded.id).then(data => {
            if (data==null) {
                reply(ResponseUtility.makeResponseMessage(1000, 'No user exists with this Id.', false));
            } else {
                reply(ResponseUtility.makeSuccessfullDataMessage(data));
            }
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static _getGraphForUser(userId) {
        let options = {
            where: {
                userId: userId,
                isDeleted: 0
            },
            include: [{
                model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_DAILY],
                as: 'graphData',
                attributes: {
                    exclude: ['userId', 'status', 'isDeleted', 'createdAt', 'updatedAt']
                },
                where: {
                    processingTime: {
                        [Op.gte]: TimeUtility.getPreviousDateTime(365)
                    }
                },
                required: false
            }
                /*,
                                {
                                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY],
                                    as: 'graphDataHourly',
                                    attributes: {
                                        exclude: ["userId", "status", "isDeleted", "updatedAt", "processingTime"]
                                    }
                                }*/
            ]
        };

        return models[constants.MODELS.JF_INDEX_MULTIPLIER].findOne(options);
    }

    static getIndexData(request, reply) {
        let funcs = {};
        let userId = request.decoded.id;
        funcs.getHourlyInfoIdsToProcess = (cb) => {
            let options = {
                where: {
                    userId: userId
                },
                attributes: [
                    [models.sequelize.fn('MIN', models.sequelize.col('id')), 'id']
                ],
                group: 'userId'
            };
            models[constants.MODELS.JF_INDEX_MULTIPLIER_HISTORY_HOURLY].findAll(options).then(response => {
                let recordIds = UsersController._makeArray(response, 'id');
                cb(null, recordIds);
            }, err => {
                cb(err);
            });
        };

        funcs.getJFIndexInformation = (getHourlyInfoIdsToProcess, cb) => {
            let options = {};

            options.where = {
                isDeleted: 0,
                userId: userId
            };

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
        };

        funcs.updateJFIndex = (getJFIndexInformation, cb) => {
            if (getJFIndexInformation==false) {
                cb(null, false);
                return;
            }
            let updateQuery = '';
            //for (let i = 0; i < getJFIndexInformation.length; i++) {
            let indexInfo = getJFIndexInformation[0].dataValues;
            indexInfo.multiplierInfo = indexInfo.multiplierInfo.dataValues;

            if (indexInfo.oldJfInfo!=null) {
                indexInfo.oldJfInfo = indexInfo.oldJfInfo.dataValues;
            }

            let multiplier = JFIndexController.getMultiplicationFactor(indexInfo.multiplierInfo);
            let JFI = JFIndexController.getJFIndexAverage(indexInfo);
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

            let calculations = {};
            calculations.jfIndex = JFI;
            calculations.jfMultiplier = multiplier;
            calculations.JFIM = JFI * multiplier;
            calculations.rateOfChange = rateOfChange;
            calculations.appearanceRateOfChange = appearanceRateOfChange;
            calculations.intelligenceRateOfChange = intelligenceRateOfChange;
            calculations.personalityRateOfChange = personalityRateOfChange;
            //}
            cb(null, calculations);
            /*models.sequelize.query(updateQuery).then(response => {
                cb(null, response);
            }, err => {
                cb(err);
            });*/
        };

        async.autoInject(funcs, (err, response) => {
            if (err) {
                console.log(err.message);
            } else {
                let outputResult = {};
                //outputResult.earlyValue = response.getJFIndexInformation[0].oldJfInfo;

                outputResult.jfIndexRawInformation = response.getJFIndexInformation[0].toJSON();
                outputResult.earlyValue = outputResult.jfIndexRawInformation.oldJfInfo;
                outputResult.calculation = response.updateJFIndex;
                //outputResult = outputResult.toJSON();
                delete outputResult.jfIndexRawInformation['oldJfInfo'];
                reply(outputResult);
                //reply(outputResult);
            }
        });
    }

    static _makeArray(input, colName = 'id') {
        let output = [];
        for (let temp in input) {
            output.push(input[temp][colName]);
        }
        return output;
    }
};
