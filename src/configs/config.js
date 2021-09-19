'use strict';

const path = require('path');

module.exports = {
    projectName: 'rest-remotebasehqhackathon', //process.env.PROJECT_NAME,
    secretKey: process.env.SERVER_SECRET_KEY || 'abc12345',
    tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '20d',
    guestTokenExpiresIn: process.env.GUEST_TOKEN_EXPIRES_IN,
    rootPath: path.join(__dirname, '/..'),
    serverUri: process.env.SERVER_URI,
    port: process.env.PORT,
    apiPrefix: '/api', // move this to env file, #zzb
    environment: process.env.NODE_ENV,
    mailer: {
        host: process.env.MAILER_HOST || "smtp.gmail.com",
        secure: true,
        port: process.env.MAILER_PORT || "465",
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.MAILER_ADDRESS,
            pass: process.env.MAILER_PWD
        }
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
        connectionLimit: 5,
    },
    aws: {
        bucketId: process.env.AWS_S3_BUCKET,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        accessKey: process.env.AWS_ACCESS_KEY,
        imagePath: process.env.AWS_IMAGE_PATH,
        basePath: process.env.AWS_BASE_PATH,
    },
    imgResizeDim: {
        large: process.env.LARGE_IMG_SIZE,
        small: process.env.THUMB_IMG_SIZE,
    },
    forceAppUpdate: process.env.FORCE_UPDATE,
    appVersion: process.env.APP_VERSION,
    /**
     * * '* * * * * *' - runs every second
     * '*!/5 * * * * *' - runs every 5 seconds
     * '10,20,30 * * * * *' - run at 10th, 20th and 30th second of every minute
     * '0 * * * * *' - runs every minute
     * '0 0 * * * *' - runs every hour (at 0 minutes and 0 seconds)
     **/
    notificationCronInterval: '* * * * * *', // every 30 seconds
};
