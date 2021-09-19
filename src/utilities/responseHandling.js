'use strict';

const statusCodes = require('http-status-codes');
const responseMsg = require('../constants/response_msgs');
const BaseUtility = require('./base');

module.exports = class ResponseUtility extends BaseUtility {

    static makeResponseMessage(status, message, success = true) {
        let temp = {
            'success': success,
            'statusCode': status,
            'message': message
        };
        return temp;
    }

    static makeSuccessfullDeletionMessage() {
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': responseMsg.DELETION_SUCCESSFULL
        }
        return temp;
    }

    static makeSuccessfullUpdationMessage() {
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': responseMsg.UPDATION_SUCCESSFULL
        }
        return temp;
    }

    static makeSuccessfullAdditionMessage(message = responseMsg.ADDITION_SUCCESSFULL) {
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': message
        }
        return temp;
    }

    static makeSuccessfullAdditionMessageWithData(data) {
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': responseMsg.ADDITION_SUCCESSFULL,
            'data': data
        }
        return temp;
    }

    static makeSuccessfullDataMessage(data, message = responseMsg.FETCH_SUCCESSFULL) {
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': message,
            'data': data
        }
        return temp;
    }

    static makeSuccessfullLoginMessage(data, message = responseMsg.FETCH_SUCCESSFULL) {
        console.log(data.auth_token);
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': message,
            'data': data,
            'token': data.token
        }
        return temp;
    }

    static makeSuccessfullDataMessageWithoutNull(data, message = responseMsg.FETCH_SUCCESSFULL) {
        data = removeNullKeys(data);
        let temp = {
            'success': true,
            'statusCode': statusCodes.OK,
            'message': message,
            'data': data
        }
        return temp;
    }

    static makeDuplicateMessage(coloumn = null) {
        let temp = {
            'success': false,
            'statusCode': statusCodes.CONFLICT,
            'message': 'Record already exists with this information'
        };

        if (coloumn!=null) {
            temp.message = coloumn + ' already exists with this information';
        }
        return temp;
    }

    static makeNoSuchDataMessage() {
        let temp = {
            'success': false,
            'statusCode': statusCodes.NOT_FOUND,
            'message': 'No record found with this ID'
        }
        return temp;
    }

}
