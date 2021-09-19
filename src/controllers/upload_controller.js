'use strict';

const uuid = require('uuid'); // to generate unique names
const awsS3 = require('../utilities/aws_sdk'); //to manage s3 materials
const path = require('path');
const ResponseUtility = require('../utilities/responseHandling');
const BaseController = require('../controllers/base_controller');
const ErrorUtility = require('../utilities/errorHandling');
const constants = require('../constants/constants');
const sharp = require('sharp');

module.exports = class UploadController extends BaseController {
    static _extName(filename) {
        const ext = path.extname(filename || '').split('.');
        return ext.pop();
    }

    static uploadProfileImage(request, reply) {
        const fileWithOrigResolution = request.payload.image;

        const fileName = `${uuid.v1()}.${UploadController._extName(fileWithOrigResolution.hapi.filename)}`;
        const imageFilePath = `${constants.CONFIGS.aws.imagePath}profile/image/` + fileName;
        const thumbnailFilePath = `${constants.CONFIGS.aws.imagePath}profile/thumbnail/` + fileName;

        const fileWithThumbnailResolution = UploadController.getFileWithXResolution(fileWithOrigResolution.hapi.filename, fileWithOrigResolution._data, 120, 120);

        const replyObj = {
            'imageName': fileName
        };

        reply(ResponseUtility.makeSuccessfullDataMessage(replyObj, 'Image Upload Successfull'));
        //should be after the promise, but will not work now if something goes wrong
        Promise.all([
            awsS3.upload(imageFilePath, fileWithOrigResolution._data),
            awsS3.upload(thumbnailFilePath, fileWithThumbnailResolution),
        ])
                .then(urls => {

                }).catch(err => {
            console.log(ErrorUtility.makeError(err));
            //reply(errorUtilities.makeError(err));
        });
    }

    static getFileWithXResolution(filename, file, width, height) {
        if (UploadController._extName(filename)=='png') {
            return sharp(file).resize(width, height).png();
        } else {
            return sharp(file).resize(width, height).jpeg();
        }
    }

}
