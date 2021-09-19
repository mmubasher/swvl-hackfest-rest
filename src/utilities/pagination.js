'use strict';
const Joi = require('joi');
const BaseUtility = require('./base');

module.exports = class PaginationUtility extends BaseUtility {
    static getPaginationParams() {
        const temp = {
            query: {
                page: Joi.number().integer().min(1).max(1000).required().example(1).description('Page number, Max(1000)'),
                limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)'),
                search: Joi.string().example('apple').description('String to search'),
                sort: Joi.string().example('id').description('Use attribute name [id]').default('id'),
                order: Joi.string().example('asc|desc').description('ASC|DESC').default('desc'),
            }
        }
        return temp;
    }

    static sendPaginationReply(reply, data) {
        reply.paginate({
            'success': true,
            'data': data.rows,
            'statusCode': 200,
            'message': 'Data retrieving successful',
        }, data.count, {
            key: 'data'
        }).code(200);
    }

    static getOffset(page, limit) {
        if (page > 0) return (page - 1) * limit;
        return 0;
    }

    static makePaginationQuery(payload, useIsDeletedAsZero = true) {
        const offset = getOffset(payload.page, payload.limit);
        var query = {};

        query.offset = offset;
        query.limit = payload.limit;

        if (payload.sort!=null && payload.order!=null) {
            if (payload.order=='desc' || payload.order=='DESC') {
                query.order = [
                    [payload.sort, 'DESC']
                ];
            } else {
                query.order = [
                    [payload.sort]
                ];
            }
        }
        if (useIsDeletedAsZero==true) {
            query.where = {
                isDeleted: 0
            };
        }
        return query;
    }
}
