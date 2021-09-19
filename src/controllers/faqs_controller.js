'use strict';

const BaseController = require('./base_controller');
const ResponseUtility = require('../utilities/responseHandling');
const ErrorUtility = require('../utilities/errorHandling');
const QueryUtility = require('../utilities/query');
const paginationUtility = require('../utilities/pagination');

const models = require('../models');
const constants = require('../constants/constants');


module.exports = class FAQsController extends BaseController {

    static create(request, reply) {

        const query = {
            question: request.payload.question,
            answer: request.payload.answer,
            status: request.payload.isActive
        };

        const options = {
            where: {
                question: request.payload.question,
                isDeleted: 0,
                status: 1
            }
        };

        models[constants.MODELS.JF_FAQS].findOne(options)
                .then(data => {
                    if (data==null) {

                        models[constants.MODELS.JF_FAQS].create(query, options)
                                .then(data => {
                                    if (data) {
                                        reply(ResponseUtility.makeSuccessfullAdditionMessage());
                                    }
                                }).catch(err => {
                            reply(ErrorUtility.makeError(err));
                        });
                    } else {
                        reply(ResponseUtility.makeDuplicateMessage());
                    }
                }).catch(err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static update(request, reply) {
        const query = {
            question: request.payload.question,
            answer: request.payload.answer,
            status: request.payload.isActive
        };

        const options = {
            where: {
                id: request.payload.id,
                isDeleted: 0,
                status: 1
            }
        };

        models[constants.MODELS.JF_FAQS].findOne(options)
                .then(data => {
                    if (data) {
                        models[constants.MODELS.JF_FAQS].update(query, options)
                                .then(data => {
                                    if (data) {
                                        reply(ResponseUtility.makeSuccessfullUpdationMessage());
                                    }
                                }).catch(err => {
                            reply(ErrorUtility.makeError(err));
                        });
                    } else {
                        reply(ResponseUtility.makeNoSuchDataMessage());
                    }
                }).catch(err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static delete(request, reply) {

        const query = {
            isDeleted: 1
        };

        const options = {
            where: {
                id: request.payload.id,
                isDeleted: 0,
                status: 1
            }
        };

        models[constants.MODELS.JF_FAQS].findOne(options)
                .then(data => {
                    if (data) {
                        models[constants.MODELS.JF_FAQS].update(query, options)
                                .then(data => {
                                    if (data) {
                                        reply(ResponseUtility.makeSuccessfullDeletionMessage());
                                    }
                                }).catch(err => {
                            reply(ErrorUtility.makeError(err));
                        });
                    } else {
                        reply(ResponseUtility.makeNoSuchDataMessage());
                    }
                }).catch(err => {
            reply(ErrorUtility.makeError(err));
        });
    }

    static getAll(request, reply) {

        let offset = paginationUtility.getOffset(request.query.page, request.query.limit);
        let limit = request.query.limit;

        const options = {
            offset: offset,
            limit: limit,
            where: {
                isDeleted: 0,
                status: 1
            }
        };

        models[constants.MODELS.JF_FAQS].findAndCountAll(options)
                .then(data => {
                    if (data) {
                        paginationUtility.sendPaginationReply(reply, data);
                    }
                }).catch(err => {
            console.log('Here at Err: ' + err);
            reply(ErrorUtility.makeError(err));
        });
    }

    static updateStatus(request, reply) {

        console.log('Status: ' + request.payload.isActive);
        let query = {
            status: request.payload.isActive
        };

        let options = {
            where: {
                id: request.payload.id,
            }
        };

        models[constants.MODELS.JF_FAQS].findOne(options)
                .then(data => {
                    if (data!=null) {
                        QueryUtility.applyUpdateQuery(constants.MODELS.JF_FAQS, query, options, reply, null, true);
                    } else {
                        reply(ResponseUtility.makeNoSuchDataMessage());
                    }
                }).catch(err => {
            reply(ErrorUtility.makeAndLogError(err));
        });
    }

    static getById(request, reply) {

        let options = {
            where: {
                id: request.params.id,
            }
        };

        models[constants.MODELS.JF_FAQS].findOne(options)
                .then(data => {
                    if (data!=null) {
                        reply(ResponseUtility.makeSuccessfullDataMessage(data));
                    } else {
                        reply(ResponseUtility.makeNoSuchDataMessage());
                    }
                }).catch(err => {
            reply(ErrorUtility.makeAndLogError(err));
        });
    }
};
