'use strict';
const models = require('../models');
// const JFIndexController = require("../controllers/jf_index_controller");
const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const BaseUtility = require('./base');
const TimeUtilities = require('../utilities/time');

module.exports = class TokenUtility {
    static makeTokenQueryData(decoded, request) {
        const options = {
            where: {
                id: decoded.id,
                isDeleted: 0,
                status: 1,
                authToken: request.headers.authorization,
            }
        }
        return options;
    }

    static authenticateUser(decoded, request, callback) {
        if (decoded.scope[0]=='GUEST') {
            callback(null, true);
            return;
        }

        let options = TokenUtility.makeTokenQueryData(decoded, request);
        let modelName = 'jf_users';
        request.decoded = {
            id: decoded.id,
        };
        models[modelName].findOne(options)
                .then(data => {
                    if (data!=null) {
                        // JFIndexController.updateLoginDays(decoded.id);
                    }
                    callback(null, data!=null);
                }, callback);
    };


    static generateToken(input, category) {
        return jwt.sign({
                    id: input.id,
                    scope: ['USER']
                },
                config.secretKey, {
                    expiresIn: config.tokenExpiresIn
                }
        );
    }

    static generateGuestToken() {
        return jwt.sign({
                    scope: ['GUEST']
                },
                config.secretKey, {
                    expiresIn: config.guestTokenExpiresIn
                }
        );
    }
}
