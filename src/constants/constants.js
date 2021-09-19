'use strict';
const Joi = require('joi');
const msgsConstants = require('./response_msgs');
const responseCodes = require('../constants/response_codes');
const config = require('../configs/config');

const JOI_FIRST_NAME = Joi.string().min(1).max(60).example('First Name').trim();
const JOI_LAST_NAME = Joi.string().min(1).max(60).example('Last Name').trim();
const JOI_FULL_NAME = Joi.string().min(1).max(60).example('Name').trim();
const JOI_EMAIL = Joi.string().email().example('hacker@hackathon.com');
const JOI_PASSWORD = Joi.string().min(8).max(20).regex(/^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9])(?=.*[0-9]).{8,20}$/).example('abc123xyz!');
const JOI_PHONE_NUMBER = Joi.string().min(5).max(20).trim();
const JOI_IMAGE = Joi.string().min(0).max(50).allow('');
const JOI_FACEBOOK_ID = Joi.string().min(5).max(60);
const JOI_USER_ID = Joi.number().integer().min(1).max(100000000).default(1).example(1);
const JOI_INT_ID = Joi.number().integer().min(1).max(100000000).default(1).example(1);

module.exports = {

    JOI: {
        FIRST_NAME: JOI_FIRST_NAME,
        LAST_NAME: JOI_LAST_NAME,
        FULL_NAME: JOI_FULL_NAME,
        EMAIL: JOI_EMAIL,
        PASSWORD: JOI_PASSWORD,
        PHONE_NUMBER: JOI_PHONE_NUMBER,
        IMAGE: JOI_IMAGE,
        FACEBOOK_ID: JOI_FACEBOOK_ID,
        USER_ID: JOI_USER_ID,
        INT_ID: JOI_INT_ID,

    },
    MODELS: {
        JF_USERS: 'jf_users',
        JF_USERS_SETTINGS: 'jf_users_settings',
        JF_CONFIGS: 'jf_configs',
        JF_REPORT_USERS: 'jf_report_users',
        JF_FAQS: 'jf_faqs',
        JF_FELLOW_TRAVELLERS: 'jf_fellow_travellers',
        JF_FRIENDS: 'jf_friends',
        JF_INDEX_INFO: 'jf_index_info',
        JF_INDEX_MULTIPLIER_HISTORY_HOURLY: 'jf_index_multiplier_history_hourly',
        JF_INDEX_MULTIPLIER_HISTORY_DAILY: 'jf_index_multiplier_history_daily',
        JF_INDEX_MULTIPLIER: 'jf_index_multiplier',
        JF_INVITATIONS: 'jf_invitations',
        JF_MULTIPLIER_INFO: 'jf_multiplier_info',
        JF_NOTIFICATIONS: 'jf_notifications',
        JF_RATINGS: 'jf_ratings',
        // JF_BUSINESSES: "jf_businesses",
        // JF_MULTIPLIER_INFO_BUSINESS: "jf_multiplier_info_business",
        // JF_INDEX_INFO_BUSINESS: "jf_index_info_business",
        // JF_INDEX_MULTIPLIER_HISTORY_DAILY_BUSINESS: "jf_index_multiplier_history_daily_business",
        // JF_INDEX_MULTIPLIER_BUSINESS: "jf_index_multiplier_business",
        // JF_INDEX_MULTIPLIER_HISTORY_HOURLY_BUSINESS: "jf_index_multiplier_history_hourly_business",
        // JF_RATINGS_BUSINESS: "jf_ratings_business",
        // JS_FELLOW_TRAVELLERS_BUSINESS: "JS_FELLOW_TRAVELLERS_business"
    },
    MESSAGES: msgsConstants,
    RESPONSE_CODES: responseCodes,
    SECURITY: {
        PLACEHOLDER_PASSWORD: 'aA12345678!',
    },
    URLS: {
        RESET_PASSWORD_REDIRECT: `${config.serverUri}/api/users/redirect`,
        UPDATE_EMAIL_REDIRECT: `${config.serverUri}/api/users/update/email`,
    },
    CONFIGS: config,
    REDIRECTION_URLS_MOBILE: {
        UPDATE_EMAIL_SUCCESS: 'remotebasehq://remotebasehq.com/updateEmail?status=success',
        UPDATE_EMAIL_INVALID_VERIFICATION_CODE: 'remotebasehq://remotebasehq.com/updateEmail?status=invalidVerificationCode',
        UPDATE_EMAIL_INVALID_EMAIL: 'remotebasehq://remotebasehq.com/updateEmail?status=invalidEmail',
        RESET_PASSWORD: 'remotebasehq://remotebasehq.com/resetPassword?',
        RESET_PASSWORD_INVALID_VERIFICATION_CODE: 'remotebasehq://remotebasehq.com/resetPassword?code=expired',
    },
    NOTIFICATION_TYPES: {
        RATING_REQUESTED: 'ratingRequested',
        USER_RATED: 'userRated',
        ANONYMOUS_RATED: 'anonymousRated',
        INVITE_ACCEPTED: 'inviteAccepted',
        RATING_REQUESTED_AGAIN: 'ratingRequestedAgain',
        FOLLOW_REQUEST: 'followRequest',
    },
    USER_DEFAULT_SETTINGS: {
        PROFILE_IS_PUBLIC: 1,
        ACCEPT_RATINGS: 1,
        ACCEPT_ANONYMOUS_RATINGS: 1,
        DISPLAY_FACEBOOK_PROFILE: 0
    }

}
