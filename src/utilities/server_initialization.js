'use strict';

const config = require('../configs/config');
const fs = require('fs-extra');

const validateEnvironmentVariables = function () {
    [
        'PORT', 'NODE_ENV', 'PROJECT_NAME', 'SERVER_SECRET_KEY', 'TOKEN_EXPIRES_IN',
        'SERVER_URI', 'DB_HOST', 'DB_USER', /* 'DB_PWD', */
        'DB_NAME', 'MAILER_PROVIDER', 'MAILER_ADDRESS', 'MAILER_PWD',
        'AWS_S3_BUCKET', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY',
        'FORCE_UPDATE', 'APP_VERSION',
    ].forEach((name) => {
        if (!process.env[name]) {
            throw new Error(`Environment variable ${name} is missing`);
        }
    });
};

const checkDir = function (input) {
    fs.ensureDir(`${config.rootPath}/` + input,
            function (e) {
                if (e) {
                    throw e;
                }
            });
};


module.exports = {
    validateEnvironmentVariables,
    checkDir
};
