'use strict';
const BaseUtility = require('./base');

module.exports = class ErrorUtility extends BaseUtility {
    static makeError(err) {
        var temp = {
            'success': false,
            'statusCode': 500,
            'message': err.message, //.replace(/[^a-zA-Z0-9 ]/g, '')
        };
        return temp;
    }

    static makePaginatedError(reply, err) {
        reply.paginate({
            'success': false,
            'statusCode': 500,
            'message': err.message,
            'data': []
        }, 0, {
            key: 'data'
        }).code(200);
    }

    static makeAndLogError(err) {
        console.error(err.message.replace(/[^a-zA-Z ]/g, ''));
        return makeError(err);
    }

    static throwError(err) {
        if (err) {
            throw err;
        }
    }

    static throwAndShowError(err) {
        if (err) {
            console.error(err);
            throw err;
        }
    }

    static showError(err) {
        if (err) {
            console.error(err);
        }
    }
}
