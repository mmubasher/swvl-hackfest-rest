'use strict';

const constants = require('../../constants/constants');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: constants.CONFIGS.aws.accessKey,
    secretAccessKey: constants.CONFIGS.aws.secretAccessKey,
    httpOptions: {
        timeout: 900000 //your timeout value
    },
});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

function deleteImage(fileName) {
    return new Promise(function (resolve, reject) {
        const deleteParams = {
            Bucket: constants.CONFIGS.aws.bucketId,
            Key: fileName
        };
        s3.deleteObject(deleteParams, function (err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
}

function upload(fileName, fileBuffer) {
    return new Promise(function (resolve, reject) {
        console.log(constants.CONFIGS.aws.bucketId);
        const uploadParams = {
            Bucket: constants.CONFIGS.aws.bucketId, Key: fileName,
            Body: fileBuffer, ContentEncoding: 'base64', ContentType: 'image/jpeg',
        };
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject(err);
            }
            if (data) {
                return resolve(data.Key);
            }
            resolve(null);
        });
    });
}

module.exports = {
    upload: upload,
    delete: deleteImage
}
