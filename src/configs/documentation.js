 'use strict';

const swaggerOptions = {
    info: {
        'title': 'rest-remotebasehqhackathon backend API',
        'description': 'Powered by node, hapi, joi and swagger-ui',
    },
    securityDefinitions: {
        'jwt': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
        },
    },
    grouping: 'tags',
    security: [{'jwt': []}],
    host: (process.env.SERVER_URI).replace(/(^\w+:|^)\/\//, ''),
    sortEndpoints: 'ordered',
    documentationPage: true,
    swaggerUI: true,
};

module.exports = {
    swaggerOptions,
};
