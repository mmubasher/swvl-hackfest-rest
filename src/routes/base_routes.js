'use strict';
const Joi = require('joi');
const GeneralController = require('../controllers/general_controller');
const inert = require('inert');

const JFIndexController = require('../controllers/jf_index_controller');

const constants = require('../constants/constants');
const localRouteTag = ['api', 'Base'];

//const paginationUtility = require("../utilities/pagination");
/*`<b>Purpose: </b> <br>
            <b>Happy Scenerio Response: </b> <br>
            <b>Other Responses: </b><br>&#9;Duplicate Email<br>
            <b>Good to know: </b><br>
            `;
*/

module.exports = [
    //signup simple
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/test',
        config: {
            description: '[APP] check the system health with simple hello world',
            notes: `<b>Purpose: </b> to test the system health
            `,
            tags: localRouteTag,
            auth: false,
            handler: (request, reply) => {
                reply('Welcome to JvstFamous API world');
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/configs',
        config: {
            description: '[APP] Get the configs for the application',
            notes: `<b>Purpose: </b>Application Configuration<br>
            <b>Happy Scenerio Response: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "imageUrl": "https://..//profile//image/",
                  "imageThumbnailUrl": "https://..//profile/thumbnail/",
                  "logoUrl": https://..//business/logo/",
                  "logoThumbnailUrl": https://..//business/logoThumbnail/"
                }
            }
            <br>
            <b>Other Responses: </b><br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getConfigurations,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/termsandconditions',
        config: {
            description: '[APP] Get the terms and conditions JSON object',
            notes: `<b>Purpose: </b> Returns user terms and conditions JSON object<br>
            <b>Happy Scenerio Response: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "htmlString": "<!DOCTYPE html>
                  html file containing terms and conditions
                  </html>"
                }
            }
            <br>
            <b>Other Responses: </b>
            {
                "success": false,
                "statusCode": 500,
                "message": "ENOENT: no such file or directory, open '..\\public\\static\\templates\\terms_and_conditions.html'"
            }
            <br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getTermsAndConditions,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/termsandconditions/html',
        config: {
            description: '[APP] Get the terms and conditions html file',
            notes: `<b>Purpose: </b> Returns user terms and conditions html file<br>
            <b>Happy Scenerio Response: </b>
            <!DOCTYPE html> html file containing terms and conditions</html>
            <br>
            <b>Other Responses: </b>
            {
                "success": false,
                "statusCode": 500,
                "message": "ENOENT: no such file or directory, open '..\\public\\static\\templates\\terms_and_conditions.html'"
            }<br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getTermsAndConditionsHTML,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/aboutus/html',
        config: {
            description: '[APP] Get the about us html file',
            notes: `<b>Purpose: </b> Returns user terms and conditions html file<br>
            <b>Happy Scenerio Response: </b>
            <!DOCTYPE html> html file containing terms and conditions</html>
            <br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getAboutUsHTML,
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/aboutus',
        config: {
            description: '[APP] Get the about us JSON object',
            notes: `<b>Purpose: </b> Returns user terms and conditions JSON object<br>
            <b>Happy Scenerio Response: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "htmlString": "<!DOCTYPE html>
                  html file containing about us
                  </html>"
                }
            }
           
            `,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getAboutUs,
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/privacypolicy',
        config: {
            description: '[APP] Get the privacy policy JSON object',
            notes: `<b>Purpose: </b> Returns privacy policy JSON object<br/>
            <b>Happy Scenerio Response: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "htmlString": "<!DOCTYPE html> </html>"
                }
              }
            <br/>
            <b>Other Responses:</b>
            {
                "success": false,
                "statusCode": 500,
                "message": "ENOENT: no such file or directory, open '..\\public\\static\\templates\\privacy_policy.html'"
            }
            <br/>`,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getPrivacyPolicy,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/privacypolicy/html',
        config: {
            description: '[APP] Get the privacy policy html file',
            notes: `<b>Purpose: </b> Returns privacy policy html <br>
            <b>Happy Scenerio Response: </b>
            <!DOCTYPE html> HTML file containing the privacy policy</html>
            <br>
            <b>Other Responses: </b>
            {
                "success": false,
                "statusCode": 500,
                "message": "ENOENT: no such file or directory, open '..\\public\\static\\templates\\privacy_policy.html'"
            }
            <br>`,
            tags: localRouteTag,
            auth: false,
            handler: GeneralController.getPrivacyPolicyHTML,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/general/public/{filename}',
        config: {
            description: '[APP] Gets the public directory',
            notes: `<b>Purpose: </b> Returns the file from public directiory passed as parameter <br>
            <b>Happy Scenerio Response: Returns the file passed as parameter </b> 
            <br>
            <b>Other Responses:
            if file is not present in the public directory, it reutns a 404 error </b>
            <br>`,
            tags: localRouteTag,
            auth: false,
            handler: {
                directory: {
                    path: 'public/static/images'
                }
            },
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {}
        }
    },
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/testpushnotification',
        config: {
            description: 'test api for push notification',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: function (request, reply) {
                //REMOVE
                /*  let token = request.params.token; //"cKocI1PnQu8:APA91bE8Yn8L0RoD1seMwLqz2w/pnhJIz6gKVHuvd5aUMcNf-MfV_QL5Mak5WH-un0C1VclRc3HTu1vod15XZlNwEguTJ8oq-h9GMOHXuAm9XF9U9z-M8G5sz7OMiXe1iuScaadoiXrQZ1CpMy9TLUlQSnlO60lbJWg";
                 const notif = {
                     fcmToken: request.params.token,
                     notification: { title: 'Some title', body: "some body" },
                     apns: {
                         headers: {
                           "apns-priority": "5",
                         },
                         payload: {
                           aps: {
                             category: "NEW_MESSAGE_CATEGORY"
                           }
                         }
                       },
                     content_available: true,
                     priority: "high"
                 };*/
                //console.log(request.payload);
                let response = PushNotificationUtility.sendPushNotification(request.payload, reply);
                //REMOVE
            },
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {
                payload: {
                    message: Joi.object()
                }
            }
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/updatejf',
        config: {
            description: 'Updates the JFIndex of the particular user',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: function (request, reply) {
                JFIndexController.updateJFIndexUser(request.payload.userId);
                reply('JFI update initiated successfully.');
            },
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required(),
                }
            }
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/updatejfall',
        config: {
            description: 'Updates the JFIndex of the all users',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: function (request, reply) {
                JFIndexController.updateJFIndexAll();
                reply('JFI update initiated successfully.');
            },
            validate: {}
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/updatehourly',
        config: {
            description: 'Updates the JFIndex hourly history',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: function (request, reply) {
                JFIndexController.updateJFIndexHistoryHourly();
                reply('JFI update initiated successfully.');
            },
            validate: {}
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/updatedaily',
        config: {
            description: 'Updates the JFIndex daily history',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: function (request, reply) {
                JFIndexController.updateJFIndexHistoryDaily();
                reply('JFI update initiated successfully.');
            },
            validate: {}
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/populateyeardata',
        config: {
            description: 'Updates the JFIndex daily history for the whole year with random values',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: JFIndexController.makeDummyDailyDataForYear,
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required(),
                    appearanceAverageFlag: Joi.boolean().required().description('Whether you want to populate appearance data or not'),
                    intelligenceAverageFlag: Joi.boolean().required().description('Whether you want to populate intelligence data or not'),
                    personalityAverageFlag: Joi.boolean().required().description('Whether you want to populate personality data or not'),
                    startDate: Joi.number().integer().min(1).required().description('The number of days back when you want to process start'),
                    endDate: Joi.number().integer().min(2).required().description('The number of days back when you want to end'),
                }
            }
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/general/makehistorypoint',
        config: {
            description: 'Updates the JFIndex daily history to a specific date',
            notes: '.....',
            tags: localRouteTag,
            auth: false,
            handler: JFIndexController.updateJFIndexAndMakeHistoryData,
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required(),
                    date: Joi.date().iso().required().description('The date you want to see on the graph'),
                }
            }
        }
    },


]
