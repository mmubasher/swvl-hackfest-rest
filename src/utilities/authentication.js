'use strict';

const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(2);
const BaseUtility = require('./base');
const randomString = require('randomstring');

module.exports = class AuthenticationUtility extends BaseUtility {
    static encryptPassword(password) {
        return bcrypt.hashSync(password, salt);
    }

    static comparePassword(data, hash, cb) {
        bcrypt.compare(data, hash, cb);
    }

    static generateResetCode() {
        let code = randomString.generate({
            length: 8,
            charset: 'alphanumeric',
        });
        code = code + Date.now();
        return code;
    }

    /**
     *
     * @param {*} length | Length of the random string
     * @param {*} type | type e.g. numeric, alphanumeric, read about randomstring to get more types, by default numeric
     */
    static generateCode(length, type = 'numeric') {
        let code = randomString.generate({
            length: length,
            charset: type,
        });
        return code;
    }
}
