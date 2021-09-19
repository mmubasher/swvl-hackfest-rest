'use strict';

const goodOptions = {
    ops: {
        interval: 100000,
    },
    reporters: {
        console: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{error: '*', log: '*', response: '*', request: '*'}],
        }, {
            module: 'good-console',
        }, 'stdout'],

        file: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{error: '*', log: '*', response: '*', request: '*'}],
        }, {
            module: 'good-squeeze',
            name: 'SafeJson',
        }, {
            module: 'good-file',
            args: ['./logs/awesome_log'],
        }],
    },
};

module.exports = {
    goodOptions,
};
