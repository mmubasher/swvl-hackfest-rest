'use strict';
const BaseController = require('./base_controller');
const ResponseUtility = require('../utilities/responseHandling');
const ErrorUtility = require('../utilities/errorHandling');
const constants = require('../constants/constants');
const fs = require('fs');

module.exports = class GeneralController extends BaseController {
    static getConfigurations(request, reply) {
        const configurations = {
            imageUrl: `${constants.CONFIGS.aws.basePath}/${constants.CONFIGS.aws.bucketId}` + '/profile/image/',
            imageThumbnailUrl: `${constants.CONFIGS.aws.basePath}/${constants.CONFIGS.aws.bucketId}` + '/profile/thumbnail/',
            logoUrl: `${constants.CONFIGS.aws.basePath}/${constants.CONFIGS.aws.bucketId}` + '/business/logo/',
            logoThumbnailUrl: `${constants.CONFIGS.aws.basePath}/${constants.CONFIGS.aws.bucketId}` + '/business/logoThumbnail/'
        };
        reply(ResponseUtility.makeSuccessfullDataMessage(configurations));
    }

    static getTermsAndConditions(request, reply) {

        fs.readFile(`././public/static/templates/terms_and_conditions.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);

                    const response = {
                        htmlString: html
                    };
                    reply(ResponseUtility.makeSuccessfullDataMessage(response));
                });
    }

    static getTermsAndConditionsHTML(request, reply) {

        fs.readFile(`././public/static/templates/terms_and_conditions.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);
                    reply(html);
                });
    }

    static getPrivacyPolicy(request, reply) {
        fs.readFile(`././public/static/templates/privacy_policy.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);

                    const response = {
                        htmlString: html
                    };

                    reply(ResponseUtility.makeSuccessfullDataMessage(response));
                });
    }

    static getPrivacyPolicyHTML(request, reply) {
        fs.readFile(`././public/static/templates/privacy_policy.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);
                    reply(html);
                });
    }

    static getAboutUs(request, reply) {

        fs.readFile(`././public/static/templates/about_us.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);

                    const response = {
                        htmlString: html
                    };
                    reply(ResponseUtility.makeSuccessfullDataMessage(response));
                });
    }

    static getAboutUsHTML(request, reply) {

        fs.readFile(`././public/static/templates/about_us.html`, 'utf8',
                (err, html) => {
                    if (err) {
                        reply(ErrorUtility.makeError(err));
                        return;
                    }

                    html = html.replace(/{{project_name}}/g, constants.CONFIGS.projectName);
                    html = html.replace(/{{project_website_url}}/g, `<a href="http://www.remotebasehqhackathon.com">http://www.remotebasehqhackathon.com</a>`);
                    reply(html);
                });
    }


};
