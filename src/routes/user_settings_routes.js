'use strict';

const Joi = require('joi');
const UserSettingsController = require('../controllers/user_settings_controller');
const constants = require('../constants/constants');
const localRouteTag = ['api', 'Users Settings'];


module.exports = [

    //Updates the notification_enabled
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/notification',
        config: {
            description: '[App] Enables or disable the user notifications',
            notes: `<b>Purpose: </b>Enables or disable the user notifications<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b><br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateNotificationSettings,
            plugins: {
                'hapi-swagger': {
                    order: 11
                }
            },
            validate: {
                payload: {
                    enableNotification: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates the location_enabled
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/location',
        config: {
            description: '[app] Enables or disable the user location',
            notes: `<b>Purpose: </b>Enables or disable the user notifications<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b><br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateLocationSettings,
            plugins: {
                'hapi-swagger': {
                    order: 2
                }
            },
            validate: {
                payload: {
                    enableLocation: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates the profiles_privacy
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/privacy',
        config: {
            description: '[app] Makes the profile public or private',
            notes: `<b>Purpose: </b>To make the profile public or private from settings<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b><br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateProfilePrivacy,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {
                payload: {
                    isCaptainProfile: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates the fb link visibility on the profile
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/fblinkvisibility',
        config: {
            description: '[app] Show or hide fb profile link on the profile page',
            notes: `<b>Purpose: </b>To enable or disable the disable the disable the visibility of the fb profile link<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateFbLinkVisibility,
            plugins: {
                'hapi-swagger': {
                    order: 3
                }
            },
            validate: {
                payload: {
                    makeFbLinkVisible: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates connect with facebook
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/connectwithfacebook',
        config: {
            description: '[app] Show or hide fb profile link on the profile page',
            notes: `<b>Purpose: </b>To enable or disable the disable the disable the visibility of the fb profile link<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.connectWithFacebook,
            plugins: {
                'hapi-swagger': {
                    order: 3
                }
            },
            validate: {
                payload: {
                    flag: Joi.boolean().default(false).required().example(true),
                    facebookId: constants.JOI.FACEBOOK_ID,
                    fbProfileLink: Joi.string().allow('')
                }
            }
        }
    },

    //Updates the Accept ratings on the profile
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/toggleratingsacceptance',
        config: {
            description: '[app] Toggle between the accept rating ON or OFF',
            notes: `<b>Purpose: </b>To enable or disable the accept rating feature,
            If enabled or disabled, the anonymous and traits ratings acceptance will also be enabled or disabled respectively<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateRatingsAcceptance,
            plugins: {
                'hapi-swagger': {
                    order: 6
                }
            },
            validate: {
                payload: {
                    acceptRatings: Joi.boolean().default(false).required().example(true),
                    acceptAnonymousRatings: Joi.boolean().default(false).required().example(true),
                    traitAppearance: Joi.boolean().default(false).required().example(true),
                    traitIntelligence: Joi.boolean().default(false).required().example(true),
                    traitPersonality: Joi.boolean().default(false).required().example(true)
                }
            }
        }
    },

    //Updates the Accept anonymous ratings on the profile
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/acceptratings/anonymous',
        config: {
            description: '[app] Toggle between the accept anonymous rating ON or OFF',
            notes: `<b>Purpose: </b>To enable or disable the accept anonymous rating feature<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateAcceptAnonymousRatings,
            plugins: {
                'hapi-swagger': {
                    order: 7
                }
            },
            validate: {
                payload: {
                    acceptAnonymousRatings: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates the Accept trait ratings on the trait appearance
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/trait/appearance',
        config: {
            description: '[app] User is accepting the ratings on the trait appearance',
            notes: `<b>Purpose: </b>To enable user to change the setting for the rating accepting on the trait appearance<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateTraitAppearance,
            plugins: {
                'hapi-swagger': {
                    order: 8
                }
            },
            validate: {
                payload: {
                    acceptAppearanceRatings: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },


    //Updates the Accept trait ratings on the trait personality
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/trait/personality',
        config: {
            description: '[app] User is accepting the ratings on the trait personality',
            notes: `<b>Purpose: </b>To enable user to change the setting for the rating accepting on the trait personality<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateTraitPersonality,
            plugins: {
                'hapi-swagger': {
                    order: 9
                }
            },
            validate: {
                payload: {
                    acceptPersonalityRatings: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },

    //Updates the Accept trait ratings on the trait intelligence
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/trait/intelligence',
        config: {
            description: '[app] User is accepting the ratings on the trait intelligence',
            notes: `<b>Purpose: </b>To enable user to change the setting for the rating accepting on the trait intelligence<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateTraitIntelligence,
            plugins: {
                'hapi-swagger': {
                    order: 10
                }
            },
            validate: {
                payload: {
                    acceptIntelligenceRatings: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },
    // Returns the settings
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/users/settings',
        config: {
            description: '[app] Gets the user settings',
            notes: `<b>Purpose: </b><br>Returns the user settings<br>
            <b>Happy Scenerio Response: </b><br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                    "id": 1,
                    "userId": 1,
                    "traitAppearance": false,
                    "traitPersonality": true,
                    "traitIntelligence": false,
                    "traitNone": false,
                    "notificationsEnabled": true,
                    "locationEnabled": true,
                    "scoreScope": "selective",
                    "isCaptainProfile": false,
                    "acceptAnonymousRating": false,
                    "facebookConnected": false,
                    "displayFacebookProfile": false,
                    "acceptRating": false
                }
            }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.getUserSettings,
            plugins: {
                'hapi-swagger': {
                    order: 13
                }
            },
            validate: {}
        }
    },
    // Unblock the user
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/unblock',
        config: {
            description: '[app] Unblocks a user',
            notes: `<b>Purpose: </b>To Unblock a user provided with the blocked user id<br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "User is unblocked sucessfully."
            } <br>
            <b>Other Responses: </b><br>
            {
                "success": false,
                "statusCode": 105,
                "message": "This user is not blocked by you."
            } <br>
            {
                "success": false,
                "statusCode": 205,
                "message": "The ID you entered does not belong to any user."
            } <br>
            or Un-authorized or invalid parameters general response <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.unblock,
            plugins: {
                'hapi-swagger': {
                    order: 5
                }
            },
            validate: {
                payload: {
                    reportUserId: constants.JOI.USER_ID
                }
            }
        }
    },
    // Gets a list of blocked users paginated
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/users/settings/block/list',
        config: {
            description: '[app] Get a pagianted list of users blocked by user',
            notes: `<b>Purpose: </b>Returns a paginated list of users blocked by the user<br>
            <b>Happy Scenerio Response: </b> <br> 
            Returns an array of blocked users along with their profiles, jfIndex, jfMultiplier, rateOfChange and profile settings <br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b><br>
            A typical item of an array looks like this: <br>
            [ <br>
                { <br>
                    "id": 2, <br>
                    "userId": 1, <br>
                    "reportUserId": 3, <br>
                    "blockedUserRelation": { <br>
                      "id": 3, <br>
                      "firstName": "dummy", <br>
                      "lastName": "2", <br> 
                      "image": "string", <br>
                      "settings": { <br>
                        "isCaptainProfile": false <br>
                        "acceptRating": false <br>
                      }, <br>
                      "indexMultiplier": { <br>
                        "jfindex": 0, <br>
                        "jfMultiplier": 1, <br>
                        "rateOfChange": 0 <br>
                      } <br>
                    } <br>
                } <br>
            ] <br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.blockedUsers,
            plugins: {
                'hapi-swagger': {
                    order: 4
                }
            },
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(100000).required().example(1).description('Page number, Max(100000)'),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)')
                }
            }
        }
    },
    // Blocks a user
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/block',
        config: {
            description: '[app] Blocks a user',
            notes: `<b>Purpose: </b>To block a user provided with the user id. This will also remove following and follower relation with the user.<br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "User is blocked sucessfully."
            } <br>
            <b>Other Responses: </b><br>
            {
                "success": false,
                "statusCode": 1000,
                "message": "This user is already blocked by you."
            } <br>
            {
                "success": false,
                "statusCode": 205,
                "message": "The ID you entered does not belong to any user."
            } <br>
            or Un-authorized or invalid parameters general response <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.block,
            plugins: {
                'hapi-swagger': {
                    order: 12
                }
            },
            validate: {
                payload: {
                    targetUserId: constants.JOI.USER_ID
                }
            }
        }
    },
    //Updates the Accept ratings on the profile
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/users/settings/acceptratings',
        config: {
            description: '[app] Toggle between the accept rating ON or OFF',
            notes: `<b>Purpose: </b>To enable or disable the accept rating feature<br>
                <b>Happy Scenerio Response: </b><br>{
                    "success": true,
                    "statusCode": 200,
                    "message": "Data updated into the system successfully."
                  }<br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Good to know: </b><br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.updateAcceptRatings,
            validate: {
                payload: {
                    acceptRatings: Joi.boolean().default(false).required().example(true),
                }
            }
        }
    },
    // Deletes the user profile
    {
        method: 'DELETE',
        path: constants.CONFIGS.apiPrefix + '/users/settings/delete',
        config: {
            description: '[app] Deletes the user account',
            notes: `<b>Purpose: </b>Removes the User Personal Info and soft deletes the user account<br>
                <b>Happy Scenerio Response: </b><br>
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data deleted from the system successfully."
                }<br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Good to know: </b><br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UserSettingsController.deleteAccount,
            plugins: {
                'hapi-swagger': {
                    order: 3
                }
            },
            validate: {}
        }
    },
];
