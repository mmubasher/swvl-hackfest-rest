'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const config = require('../configs/config');
const constants = require('../constants/constants');
const BaseUtility = require('./base');
const logo_url = config.serverUri + '/api/general/public/logo.png';


module.exports = class EmailUtility extends BaseUtility {

    static _sendEmail(to, subject, text, html, cb) {
        let transporter = nodemailer.createTransport(config.mailer);
        let mailOptions = {
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html,
            from: constants.CONFIGS.mailer.auth.user
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                cb(error);
                return;
            }
            cb(null, info);
        });
    };

    static getMailTemplate(templateName, callback) {
        fs.readFile(`././public/static/templates/${templateName}.html`, 'utf8',
                (err, data) => {
                    if (err) {
                        return callback(err, null);
                    }
                    return callback(null, data);
                });
    };

    static sendPwdChangedMail(user, module, callback) {
        getMailTemplate('password_changed',
                (err, template) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    let htmlContent = template;
                    if (user.name!=null) {
                        htmlContent = htmlContent.replace('{{name}}', user.name);
                    } else {
                        htmlContent = htmlContent.replace('{{name}}', user.firstName + ' ' + user.lastName);
                    }
                    htmlContent = htmlContent.replace(/{{project_name}}/g, config.projectName);
                    htmlContent = htmlContent.replace(/{{logo_url}}/g, logo_url);
                    htmlContent = htmlContent.replace('{{year}}', (new Date().getFullYear()));
                    let subject = `${config.projectName} Password Changed Successfully`;
                    _sendEmail(user.email, subject, '', htmlContent,
                            (err, response) => {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                if (!response.accepted.length) {
                                    callback(null, false);
                                    return;
                                }
                                callback(null, true); // email sent successfully
                            });
                });
    };

    static sendForgotPwdMail(user, cb) {
        EmailUtility.getMailTemplate('password_reset',
                (err, template) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    //const txtContent = `Click here ${config.serverUri}/api/reset?code=${user.reset_code}
                    //       to reset your password on ${config.projectName}`; // plain text body

                    let htmlContent = template;

                    if (user.name!=null) {
                        htmlContent = htmlContent.replace('{{name}}', user.name);
                    } else {
                        htmlContent = htmlContent.replace('{{name}}', user.firstName + ' ' + user.lastName);
                    }
                    console.log(`${constants.URLS.RESET_PASSWORD_REDIRECT}?code=${user.resetCode}`);
                    htmlContent = htmlContent.replace(/{{action_url}}/g, `${constants.URLS.RESET_PASSWORD_REDIRECT}?code=${user.resetCode}`);
                    htmlContent = htmlContent.replace(/{{project_name}}/g, config.projectName);
                    htmlContent = htmlContent.replace(/{{logo_url}}/g, logo_url);
                    htmlContent = htmlContent.replace('{{year}}', (new Date().getFullYear()));

                    let subject = `${config.projectName} Reset Your Password`;

                    EmailUtility._sendEmail(user.email, subject, null, htmlContent,
                            (err, response) => {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                if (!response.accepted.length) {
                                    cb(null, false);
                                    return;
                                }
                                cb(null, true); // email sent successfully
                            });
                });
    };

    static sendChangeEmailIdEmail(user, cb) {
        EmailUtility.getMailTemplate('email_change_request',
                (err, template) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    const txtContent = `Click here ${config.serverUri}/api/users/update/email?code=${user.emailVerificationCode}&email=${user.requestedEmail}
                         to update your email id on ${config.projectName}`; // plain text body

                    let htmlContent = template;

                    if (user.fullName!=null) {
                        htmlContent = htmlContent.replace('{{name}}', user.fullName);
                    } else {
                        htmlContent = htmlContent.replace('{{name}}', user.firstName + ' ' + user.lastName);
                    }
                    console.log(`${constants.URLS.UPDATE_EMAIL_REDIRECT}?code=${user.emailVerificationCode}`);
                    htmlContent = htmlContent.replace(/{{action_url}}/g, `${constants.URLS.UPDATE_EMAIL_REDIRECT}?code=${user.emailVerificationCode}&requestedEmail=${user.requestedEmail}`);
                    htmlContent = htmlContent.replace(/{{new_email_id}}/g, user.requestedEmail);
                    htmlContent = htmlContent.replace(/{{project_name}}/g, config.projectName);
                    htmlContent = htmlContent.replace(/{{logo_url}}/g, logo_url);
                    htmlContent = htmlContent.replace('{{year}}', (new Date().getFullYear()));

                    let subject = `${config.projectName} Update Your Email`;

                    //const subject = "Some Subject";

                    EmailUtility._sendEmail(user.requestedEmail, subject, null, htmlContent,
                            (err, response) => {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                if (!response.accepted.length) {
                                    cb(null, false);
                                    return;
                                }
                                cb(null, true); // email sent successfully
                            });
                });
    };

    static sendSignUpEmail(user, callback) {
        EmailUtility.getMailTemplate('welcome',
                (err, template) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    const txtContent = `TEMP email`; // plain text body
                    let htmlContent = template;
                    if (user.name!=null) {
                        htmlContent = htmlContent.replace('{{name}}', user.name);
                    } else {
                        htmlContent = htmlContent.replace('{{name}}', user.firstName + ' ' + user.lastName);
                    }
                    htmlContent = htmlContent.replace(/{{action_url}}/g, `${config.serverUri}/api/users/resetpassword?code=temporary email`);
                    htmlContent = htmlContent.replace(/{{project_name}}/g, config.projectName);
                    htmlContent = htmlContent.replace(/{{logo_url}}/g, logo_url);
                    htmlContent = htmlContent.replace('{{year}}', (new Date().getFullYear()));
                    let subject = `Welcome to ${config.projectName}`;
                    EmailUtility._sendEmail(user.email, subject, txtContent, htmlContent,
                            (err, response) => {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                if (!response.accepted.length) {
                                    callback(null, false);
                                    return;
                                }
                                callback(null, true); // email sent successfully
                            });
                });
    };

    static sendInvitationEmail(firstName, email, cb) {
        EmailUtility.getMailTemplate('invitation',
                (err, template) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    let htmlContent = template;

                    htmlContent = htmlContent.replace('{{first_name}}', firstName);
                    htmlContent = htmlContent.replace(/{{logo_url}}/g, logo_url);
                    let subject = `${config.projectName} Invitation`;
                    EmailUtility._sendEmail(email, subject, 'Text Email', htmlContent,
                            (err, response) => {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                if (!response.accepted.length) {
                                    cb(null, false);
                                    return;
                                }
                                cb(null, true); // email sent successfully
                            });
                }
        );

    }
}
