'use strict';

const statusCodes = require('http-status-codes');
const Joi = require('joi');
//const categoriesController = require("../controllers/categories_controller");
const UploadController = require('../controllers/upload_controller');
const constants = require('../constants/constants');
const localRouteTag = ['api', 'Uploads'];


const localPlugins = {
    'hapi-swagger': {
        payloadType: 'form',
    },
};

const localPayload = {
    output: 'stream',
    allow: 'multipart/form-data',
    maxBytes: 20000000, // 10 Mb Limit
    parse: true,
    timeout: 900000, // 15 mins
};

const localTimeout = {
    socket: 950000,
};

const localValidate = {
    payload: {
        image: Joi.any()
                .meta({
                    swaggerType: 'file'
                })
                .description('.png|.jpg file').required(),

    }
};


module.exports = [
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/upload/s3/profile',
        config: {
            description: '[App] Upload the image to the s3 server and return image - url',
            notes: `Uploads the image to the image server and will return the image name<br><br>
            <b>It stores the two images:</b> <br>
            1 original (Same resolution as uploaded, please provide some resolution if you need some fix resolution)<br>
            1 thumbnail of 120*120 <br><br>
            <b> Success Response: </b><br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Image Upload Successfull",
                "data": {
                  "image_name": "741a2740-4710-11e8-a425-cbec3a512123.png"
                }
              }<br>
            <b>Good to know</b><br>
            Upper limit: 20000000 bytes<br>
            Timeout limit: 15 mins<br>
            Complete image URLs: check config call
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                mode: 'optional',
            },
            handler: UploadController.uploadProfileImage,
            plugins: localPlugins,
            payload: localPayload,
            validate: localValidate,
            timeout: localTimeout,
        }
    },
];
