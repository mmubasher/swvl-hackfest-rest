'use strict';

const Joi = require('joi');
const NotificationsController = require('../controllers/notifications_controller');
const constants = require('../constants/constants');
const localRouteTag = ['api', 'Notifications',];


module.exports = [
    //notifications friend request count
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/notifications/follow/count',
        config: {
            description: '[app] Get the count of unresponded friend requests',
            notes: `<b> Happy Scenerio Response: </b><br> {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "count": 1
                }
              }</br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.getFollowRequestCount,
            validate: {}
        }
    },

    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/notifications/unseen/count',
        config: {
            description: '[app] Get the count of unseen notifications',
            notes: `<b> Happy Scenerio Response: </b><br> {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "count": 1
                }
              }</br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.getUnseenNotificationsCount,
            validate: {}
        }
    },

    //notifications friend request detail
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/notifications/follow',
        config: {
            description: '[app] Get the listing of the un-responded friend requests <b>Paginated</b>',
            notes: `<b> Happy Scenerio Response: </b><br>
            {
                "metadata": {
                  "page": 1,
                  "limit": 20,
                  "count": 1,
                  "totalPages": 1,
                  "totalCount": 1
                },
                "data": [
                  {
                    "id": 5,
                    "fromUserId": 4,
                    "createdAt": "2018-06-03T09:22:26.000Z",
                    "updatedAt": "2018-06-03T09:22:26.000Z",
                    "followerDetail": {
                      "firstName": "id 4",
                      "lastName": "Last Name",
                      "image": "string",
                      "indexMultiplier": {
                        "jfIndex": 0,
                        "jfMultiplier": 1,
                        "rateOfChange": 0
                      }
                    }
                  }
                ],
                "success": true,
                "statusCode": 200,
                "message": "Data retrieving successfull"
              }<br>`,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.getFollowRequestListing,
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(1000).required().example(1).description('Page number, Max(1000)').default(1),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)').default(20),
                }
            }
        }
    },

    // Mark notifications as read
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/notifications/read',
        config: {
            description: '[app] Marks the notificaions as read',
            notes: `<b> Happy Scenerio Response: </b><br> </br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.markAsRead,
            validate: {
                payload: {
                    notifications: Joi.array().items(
                            Joi.object({
                                id: Joi.number().integer().min(1).max(1000000).required().example(1),
                                // fromUserId: Joi.number().integer().min(1).max(1000000).required().example(1)
                            }).required().min(1)
                    ).required()
                }
            }
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/notifications/read/all',
        config: {
            description: '[app] Marks the all notificaions as read',
            notes: `<b> Happy Scenerio Response: </b><br> </br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.markAllAsRead,
            validate: {}
        }
    },

    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/notifications/clear/all',
        config: {
            description: '[app] Clears all notificaions',
            notes: `<b> Happy Scenerio Response: </b><br> </br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.clearAll,
            validate: {}
        }
    },
    // Get paginated list of Recent notifications
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/notifications',
        config: {
            description: '[app] Get all the recent notificaions with pagination',
            notes: `<b> Happy Scenerio Response: </b><br>
            {
                "metadata": {
                  "page": 1,
                  "limit": 20,
                  "count": 1,
                  "totalPages": 1,
                  "totalCount": 1
                },
                "data": [
                  {
                    "id": 3,
                    "userId": 5,
                    "fromUserId": 6,
                    "notificationType": "ratingRequested",
                    "isSeen": false,
                    "jfIndex": 0,
                    "jfMultiplier": 0,
                    "createdAt": null,
                    "notificationFrom": {
                      "id": 6,
                      "firstName": "Dummy",
                      "lastName": "1",
                      "image": "string",
                      "settings": {
                        "isPublicProfile": false
                      }
                    },
                    "notificationDetail": {
                      "title": "Rating Requested",
                      "description": "Dummy requested a rating from you."
                    }
                  }
                ],
                "success": true,
                "statusCode": 200,
                "message": "Data retrieving successfull"
              }</br>
              `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NotificationsController.getRecentNotificationsListing,
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(1000).required().example(1).description('Page number, Max(1000)').default(1),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)').default(20),
                }
            }
        }
    },


    /*  //notifications has
    {
        method: "GET",
        path: constants.CONFIGS.apiPrefix + "/notifications/hasunread",
        config: {
            description: "[app] Inviting another using the SMS",
            notes: ` `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],                
            },
            handler: function(request,reply){},
            validate: {
                query: {
                    phoneNumber: constants.JOI.PHONE_NUMBER,
                }
            }
        }
    },

    //notifications has
    {
        method: "GET",
        path: constants.CONFIGS.apiPrefix + "/notifications",
        config: {
            description: "[app] Inviting another using the SMS",
            notes: ` `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],                
            },
            handler: function(request,reply){},
            validate: {
                query: {
                    phoneNumber: constants.JOI.PHONE_NUMBER,
                }
            }
        }
    },
*/
];
