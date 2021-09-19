'use strict';

require('dotenv').config();
const hapi = require('hapi');
const server = new hapi.Server();
const config = require('./src/configs/config');
const routes = require('./src/routes/index');
const documentation = require('./src/configs/documentation');
const tokenUtilities = require('./src/utilities/token');
const pagination = require('./src/configs/pagination');

server.connection({
    port: config.port, labels: ['api'], routes: {cors: true},
});

var registrationErrors = false;

server.register([
    require('hapi-auth-jwt2'),
    require('inert'),
    require('vision'),
    {
        register: require('hapi-swagger'),
        options: documentation.swaggerOptions
    },
    {
        register: require('hapi-pagination'),
        options: pagination.options,
    }
], function (err) {
    if (err) {
        registrationErrors = true;
        throw err;
    } else {
        server.start(function () {
            console.log(`Server Started at : ${server.info.uri}`);
        });
    }
});

server.auth.strategy('jwt', 'jwt', 'optional', {
    key: config.secretKey,
    validateFunc: tokenUtilities.authenticateUser,
    verifyOptions: {algorithms: ['HS256']},
});

server.route(routes.routes);
