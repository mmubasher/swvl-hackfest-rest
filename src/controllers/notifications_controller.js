'use strict';

const BaseController = require('./base_controller');
const ResponseUtility = require('../utilities/responseHandling');
const ErrorUtility = require('../utilities/errorHandling');
const PaginationUtility = require('../utilities/pagination');
const TimeUtility = require('../utilities/time');

const constants = require('../constants/constants');
const models = require('../models');
const Op = models.Sequelize.Op;

module.exports = class NotificationsController extends BaseController {

    static getFollowRequestCount(request, reply) {
        const userId = request.decoded.id;
        const options = {
            where: {
                userId: userId,
                isDeleted: 0,
                acceptRequest: null
            },
            include: [{
                model: models[constants.MODELS.JF_USERS],
                as: 'followerDetail',
                attributes: ['firstName', 'lastName', 'image'],
                include: [{
                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
                    as: 'indexMultiplier',
                    attributes: ['jfIndex', 'jfMultiplier', 'rateOfChange'],
                }],
                where: {
                    isDeleted: 0,
                },
                required: true
            }]
        };
        models[constants.MODELS.JF_FRIENDS].count(options).then(data => {
            const responseObj = {
                count: data
            };
            reply(ResponseUtility.makeSuccessfullDataMessage(responseObj));
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static getFollowRequestListing(request, reply) {
        const userId = request.decoded.id;
        const offset = PaginationUtility.getOffset(request.query.page, request.query.limit);

        const options = {
            offset: offset,
            limit: request.query.limit,
            where: {
                userId: userId,
                isDeleted: 0,
                acceptRequest: null
            },
            attributes: ['id', 'friendUserId', 'createdAt', 'updatedAt'],
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: models[constants.MODELS.JF_USERS],
                as: 'followerDetail',
                attributes: ['firstName', 'lastName', 'image'],
                include: [{
                    model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
                    as: 'indexMultiplier',
                    attributes: ['jfIndex', 'jfMultiplier', 'rateOfChange'],
                }],
                where: {
                    isDeleted: 0,
                },
                required: true
            }]
        };
        models[constants.MODELS.JF_FRIENDS].findAndCountAll(options).then(data => {
            PaginationUtility.sendPaginationReply(reply, data);
        }, err => {
            ErrorUtility.makePaginatedError(reply, err);
        });
    }

    static _markAsRead(notificationIds) {
        let query = {
            isSeen: 1,
            seenAt: TimeUtility.currentTimeUTC(),
        };
        let options = {
            where: {
                id: {
                    [Op.in]: notificationIds
                },
                isDeleted: 0
            }
        };

        return models[constants.MODELS.JF_NOTIFICATIONS].update(query, options);
    }

    static markAsRead(request, reply) {
        NotificationsController._markAsRead(request.payload.notifications).then(data => {
            reply(ResponseUtility.makeSuccessfullUpdationMessage());
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static _markAllAsRead(userId) {

        let query = {
            isSeen: 1,
            seenAt: TimeUtility.currentTimeUTC(),
        };

        let options = {
            where: {
                isDeleted: 0,
                userId: userId
            }
        };

        return models[constants.MODELS.JF_NOTIFICATIONS].update(query, options);
    }

    static _clearAll(userId) {

        let query = {
            isDeleted: 1,
            status: 0
        };

        let options = {
            where: {
                isDeleted: 0,
                userId: userId
            }
        };

        return models[constants.MODELS.JF_NOTIFICATIONS].update(query, options);
    }

    static markAllAsRead(request, reply) {
        NotificationsController._markAllAsRead(request.decoded.id).then(data => {
            reply(ResponseUtility.makeSuccessfullUpdationMessage());
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static clearAll(request, reply) {
        NotificationsController._clearAll(request.decoded.id).then(data => {
            reply(ResponseUtility.makeSuccessfullUpdationMessage());
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static getRecentNotificationsListing(request, reply) {
        const offset = PaginationUtility.getOffset(request.query.page, request.query.limit);
        let options = {
            attributes: ['id', 'userId', 'fromUserId', 'notificationType', 'isSeen', 'jfIndex', 'jfMultiplier', 'createdAt'],
            where: {
                userId: request.decoded.id,
                isDeleted: 0
            },
            include: [{
                model: models['jf_users'],
                as: 'notificationFrom',
                include: [{
                    model: models['jf_users_settings'],
                    as: 'settings',
                    attributes: ['isCaptainProfile']
                },],
                attributes: ['id', 'firstName', 'lastName', 'image'],
            },],
            order: [
                ['id', 'DESC']
            ],
        };

        let notificationIds = [];
        options.offset = offset;
        options.limit = request.query.limit;
        models[constants.MODELS.JF_NOTIFICATIONS].findAndCountAll(options)
                .then(data => {
                    data.rows.forEach(record => {

                        let firstName = record.dataValues.notificationFrom.firstName;
                        let lastName = record.dataValues.notificationFrom.lastName;
                        let isPublicProfile = record.dataValues.notificationFrom.settings.isCaptainProfile;
                        let notificationType = record.dataValues.notificationType;
                        let jfIndex = record.dataValues.jfIndex;
                        let jfMultiplier = record.dataValues.jfMultiplier;
                        notificationIds.push(record.dataValues.id);

                        record.dataValues.notificationDetail = NotificationsController._notificationGenerator(firstName, lastName, isPublicProfile,
                                notificationType, jfIndex, jfMultiplier);
                    });
                    PaginationUtility.sendPaginationReply(reply, data);
                    NotificationsController._markAllAsRead(request.decoded.id);//._markAsRead(notificationIds);
                }, err => {
                    ErrorUtility.makePaginatedError(reply, err);
                }).catch(err => {
            ErrorUtility.makePaginatedError(reply, err);
        });
    }

    static pad(n) {
        var s = '000' + Math.round(n);
        return s.substr(s.length - 4);
    }

    static _notificationGenerator(firstName, lastName, isPublicProfile,
                                  notificationType, jfIndex, jfMultiplier) {

        let userName = '';
        let title = '';
        let description = '';


        if (notificationType=='userRated' || notificationType=='anonymousRated') {
            userName = (notificationType=='userRated') ? firstName + ' ' + lastName:'Someone';
            title = `${userName} has rated you`;
            description = `Your JF Index is now ${NotificationsController.pad(jfIndex * jfMultiplier)}`;
        } else if (notificationType=='ratingRequested') {
            userName = firstName + ' ' + lastName;
            title = 'Rating requested';
            description = `${userName} requested a rating from you.`;
        } else if (notificationType=='ratingRequestedAgain') {
            userName = firstName + ' ' + lastName;
            title = 'Rating requested again';
            description = `${userName} requested a rating from you.`;
        } else if (notificationType=='inviteAccepted') {
            userName = firstName + ' ' + lastName;
            title = 'Invite accepted';
            description = `${userName} has accepted your invite`;
        }

        let notification = {};
        notification.title = title;
        notification.description = description;

        return notification;
    }

    /**
     * Return promise of the count query
     * @param {*} userId
     */
    static _getUnseenNotificationsCount(userId) {
        let options = {
            where: {
                userId: userId,
                isDeleted: 0,
                status: 1,
                isSeen: 0
            }
        };
        return models[constants.MODELS.JF_NOTIFICATIONS].count(options);
    }

    static getUnseenNotificationsCount(request, reply) {
        const userId = request.decoded.id;
        NotificationsController._getUnseenNotificationsCount(userId).then(data => {
            const responseObj = {
                count: data
            };
            reply(ResponseUtility.makeSuccessfullDataMessage(responseObj));
        }, err => {
            reply(ErrorUtility.makeError(err));
        });
    }
};
