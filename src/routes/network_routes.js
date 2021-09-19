'use strict';

const Joi = require('joi');
const NetworkController = require('../controllers/network_controller');
const constants = require('../constants/constants');
const localRouteTag = ['api', 'Network / Followers',];


module.exports = [
    //Generate a Follow request
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/network/request/makefriend',
        config: {
            description: '[app] User is requesting a friend request from another user',
            notes: `<b>Purpose: </b>To request the friend from another user<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Follow request has been sent successfully."
              }<br>
              {
                "success": true,
                "statusCode": 200,
                "message": "User has been followed successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Trying to friend your own self:</b>{
                "success": false,
                "statusCode": 1001,
                "message": "You can't friend yourself."
              }<br>
            <b>Deleted or un-existing user:</b>{
                "success": false,
                "statusCode": 205,
                "message": "This user no longer exists."
              } <br>
            <b>User blocked:</b>{
                "success": false,
                "statusCode": 2000,
                "message": "This user is blocked by you."
              }<br>
            <b>User has blocked you:</b>{
                "success": false,
                "statusCode": 2001,
                "message": "This user has blocked you."
              }<br>
            <b>Follow request already exists:</b>{
                "success": false,
                "statusCode": 304,
                "message": "Follow request already exist."
            }<br>
            <b>User is already following target:<b> {
                "success": false,
                "statusCode": 1002,
                "message": "You are already following this user."
            }<br>

            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.sendFollowRequest,
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required(),
                }
            }
        }
    },
    //Discover User
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/network/discover',
        config: {
            description: '[app] User wants to discover the users in the JvstFamovs (search filters)<b>Paginated</b>',
            notes: `<b>Purpose: </b>To dicover the new users<br>
            <b>Happy Scenerio Response: </b><br><br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: <br>User Object: </b></br>    {
                "id": 2,
                "firstName": "id 2",
                "lastName": "A",
                "image": "string",
                "location": null,
                "biography": null,
                "indexMultiplier": {
                  "jfIndex": 2.5,
                  "jfMultiplier": 1,
                  "rateOfChange": 0,
                  "appearanceAverage": 0,
                  "intelligenceAverage": 0,
                  "personalityAverage": 0
                },
                "settings": {
                  "isCaptainProfile": false,
                  "acceptRating": false,
                  "acceptAnonymousRating": false
                },
                "friendRelation": {
                  "acceptRequest": true,
                  "isSeen": false
                },
                "blockedByMe": null,
                "blockedByThem": null
              }<br>
              or with 
              "friendRelation": {
                "acceptRequest": true,
                "isSeen": false
              } where accpetRequest can be true(accepted), false(rejected) and null(not responded)
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.discover,
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(100000).required().example(1).description('Page number, Max(100000)'),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)'),

                    search: Joi.string().max(50).default('').example('John').allow('').description('Search Text: will be searched accross first name and last name'),

                    distance: Joi.number().integer().valid([25, 50, 100, 500]).description('The distance in which user is to search'),

                    
                    peopleRatedByMe: Joi.boolean().description('Get the people rated by me or not'),

                    peopleInMyPortfolio: Joi.boolean().description('Get the people in my portfolio'),

                    sorting: Joi.string().valid(['indexAscending', 'indexDescending', 'alphabaticalAscending', 'alphabaticalDescending']).default('indexDescending')
                }
            }
        }
    },

    //Users, a user is following
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/network/friends',
        config: {
            description: '[app] User wants to see the users he is following (search filters)<b>Paginated</b>',
            notes: `<b>Purpose: </b>To get the users, a user is following<br>
            <b>Happy Scenerio Response: </b><br>
            {
                "metadata": {
                  "page": 1,
                  "limit": 1000,
                  "count": 1,
                  "totalPages": 1,
                  "totalCount": 1
                },
                "data": [
                  {
                    "id": 6,
                    "firstName": "Dummy",
                    "lastName": "1",
                    "image": "string",
                    "indexMultiplier": {
                      "jfIndex": 0,
                      "jfMultiplier": 1,
                      "rateOfChange": 0
                    },
                    "settings": {
                      "isCaptainProfile": false,
                      "acceptRating": false,
                      "acceptAnonymousRating": false
                    },
                    "friendRelation": {
                      "acceptRequest": true,
                      "isSeen": true
                    }
                  }
                ],
                "success": true,
                "statusCode": 200,
                "message": "Data retrieving successfull"
            }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </b> Same as network response object<br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.following,
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(100000).required().example(1).description('Page number, Max(100000)'),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)')
                }
            }
        }
    },

    //Users, a user is following or is followed by
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/network',
        config: {
            description: '[app] User wants to see the users he is following or is followed by(search filters)<b>Paginated</b>',
            notes: `<b>Purpose: </b>To get the users, a user is following or is followed by<br>
            <b>Happy Scenerio Response: </b><br><br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </br> User Object:</b><br>{
                "id": 2,
                "firstName": "id 2",
                "lastName": "Last Name",
                "image": "string",
                "indexMultiplier": {
                  "jfIndex": 0,
                  "jfMultiplier": 1,
                  "rateOfChange": 0
                },
                "settings": {
                  "isCaptainProfile": false,
                  "acceptRating": false,
                  "acceptAnonymousRating": false
                }
              }</br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.network,
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(100000).required().example(1).description('Page number, Max(100000)'),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)'),

                    /*search: Joi.string().max(50).default("").example("John").allow("").description("Search Text: will be searched accross first name and last name"),

                    distance: Joi.number().integer().valid([25, 50, 100, 500]).description("The distance in which user is to search"),

                    traitAppearance: Joi.boolean().description("Filter the result on the appearance trait"),
                    traitIntelligence: Joi.boolean().description("Filter the result on the intelligence trait"),
                    traitPersonality: Joi.boolean().description("Filter the result on the personality trait"),

                    peopleWithAllRatingTypes: Joi.boolean().description("Ratings: all"),
                    peopleAcceptingRating: Joi.boolean().description("Ratings: Accepting ratings"),
                    peopleAcceptingAnonymousRating: Joi.boolean().description("Ratings: Accepting anonymous rating"),
                    peopleNotAcceptingRating: Joi.boolean().description("Ratings: Not accepting ratings"),


                    peopleRatedByMe: Joi.boolean().description("Get the people rated by me or not"),

                    peopleInMyPortfolio: Joi.boolean().description("Get the people in my portfolio"),

                    sorting: Joi.string().valid(["indexAscending", "indexDescending", "alphabaticalAscending", "alphabaticalDescending"])*/
                }
            }
        }
    },

    //Get a user profile
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/network/profile',
        config: {
            description: '[app] User wants to see the profile of the user',
            notes: `<b>Purpose: </b>To get the profile of the user<br>
            <b>Happy Scenerio Response: </b><br><br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                    user profile object
                }
            }
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </br> User Object:</b><br>{
                "id": 7,
                "firstName": "Dummy",
                "lastName": "1",
                "image": "string",
                "biography": null,
                "location": null,
                "indexMultiplier": {
                  "jfIndex": 0,
                  "jfMultiplier": 1,
                  "rateOfChange": 0
                },
                "multiplierInfo": {
                  "ratingsReceived": 0,
                  "ratingsGiven": 0,
                  "ratingsRequested": 0
                },
                "settings": {
                  "isCaptainProfile": true,
                  "acceptRating": false,
                  "acceptAnonymousRating": false,
                  "traitAppearance": true,
                  "traitPersonality": true,
                  "traitIntelligence": true,
                  "facebookConnected": false,
                  "displayFacebookProfile": false,
                  "locationEnabled": true
                },
                "friendRelation": {
                  "acceptRequest": null
                },
                "blockedByMe": {
                  "id": 23,
                  "userId": 5,
                  "reportUserId": 7
                },
                "blockedByThem": {
                  "id": 26,
                  "userId": 7,
                  "reportUserId": 5
                },
                "friendRelation": null,
                "rateButtonInfo": {
                    "isAnonymous": false,
                    "lastActionTime": "2018-06-28T12:50:37.000Z",
                    "count": null,
                    "traitAppearance": [
                      1,
                      20,
                      15
                    ],
                    "traitIntelligence": [
                      8,
                      3,
                      19
                    ],
                    "traitPersonality": [
                      12,
                      14,
                      10
                    ]
                  },
                "requestButtonInfo": {
                  "isSeen": false,
                  "seenAt": null,
                  "lastActionTime": "2018-06-21T11:20:53.000Z"
                }
              }</br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.getUserProfile,
            validate: {
                query: {
                    userId: constants.JOI.USER_ID.required(),
                }
            }
        }
    },

    //Accept a friend request
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/network/friendrequest/accept',
        config: {
            description: '[app] To accept a particular friend request',
            notes: `<b>Purpose: </b>To accept a particular friend request<br>
            <b>Happy Scenerio Response: </b><br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
            }<br>
            <b>Other Responses: </b><br>
            Un-authorized or invalid parameters general response<br>
            <b>User does not exist any more: </b><br>
            {
                "success": false,
                "statusCode": 106,
                "message": "The user no longer exists."
            }</br>
            <b>User is blocked by you: </b><br>
            {
                "success": false,
                "statusCode": 1002,
                "message": "The user is blocked by you."
            }</br>
            <b></b><br></br>
            <b>Good to know: </br></br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.acceptFollowRequest,
            validate: {
                payload: {
                    requestId: constants.JOI.INT_ID.required(),
                    userId: constants.JOI.USER_ID.required().description('The id of the user who sent the friend request'),
                }
            }
        }
    },

    //unfollow a user
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/network/unfollow',
        config: {
            description: '[app] To unfollow a particular following user',
            notes: `<b>Purpose: </b>To unfollow a user you are follwoing<br>
            <b>Happy Scenerio Response: </b><br>
            {
                "success": true,
                "statusCode": 200,
                "message": "User has been successfully unfollowed."
            }<br>
            <b>No user exists with that requested id:</b><br>
            {
                "success": false,
                "statusCode": 106,
                "message": "No user exists with this ID."
            }<br>
            <b>Not following the user:</b><br>
            {
                "success": false,
                "statusCode": 1001,
                "message": "You are not following the user."
            }<br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.unFollowRequest,
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required().description('The id of the user you want to unfollow'),
                }
            }
        }
    },

    // Reject/decline a friend request
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/network/friendrequest/decline',
        config: {
            description: '[app] To Decline a particular friend request',
            notes: `<b>Purpose: </b>To decline a particular friend request<br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
              }<br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: </br></br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.declineFollowRequest,
            validate: {
                payload: {
                    requestId: constants.JOI.INT_ID.required(),
                }
            }
        }
    },

    // Returns contacts having JF app installed with pagination
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/network/contacts',
        config: {
            description: '[app] User wants to check which of his contacts have JF app installed',
            notes: `<b>Purpose: </b>To get the list of users having jf installed <br>
            <b style="color:red;">Please priortize the search in the existing users first</b><br>
            <b>Happy Scenerio Response: </b><br>{
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": []
              }<br><br>
              {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "existingUsers": [
                    {
                      "id": 5,
                      "firstName": "Abdul",
                      "lastName": " Rasheed",
                      "phoneNumber": "string",
                      "image": "string",
                      "email": "string",
                      "indexMultiplier": {
                        "jfIndex": 0,
                        "jfMultiplier": 1,
                        "rateOfChange": 0
                      },
                      "settings": {
                        "isCaptainProfile": true,
                        "acceptRating": false,
                        "acceptAnonymousRating": false
                      },
                      "friendRelation": null
                    }
                  ],
                  "invitedUsers": [{phoneNumber: "", email: ""}
                  ]
                }
              }
              <br>
            <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
            <b>Good to know: <br>
              "friendRelation": {
                "acceptRequest": true,
                "isSeen": false
              } where accpetRequest can be true(accepted), false(rejected) and null(not responded)
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.getContacts,
            validate: {
                payload: {
                    contacts: Joi.array().items(
                            Joi.string().max(100).required()
                    )
                }
            }
        }
    },

    //Request a user to rate you
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/network/request/rate',
        config: {
            description: '[app] User is requesting a rating from another user',
            notes: `<b>Purpose: </b>To request the rating from another user<br>
                <b>Happy Scenerio Response: </b><br>{
                    "success": true,
                    "statusCode": 200,
                    "message": "Rating request has been sent successfully."
                  }<br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Trying to rate your own self: </b>{
                    "success": false,
                    "statusCode": 1000,
                    "message": "You can't rate yourself."
                  }</br>
                <b>Deleted or un-existing user: </b>{
                    "success": false,
                    "statusCode": 205,
                    "message": "This user no longer exists."
                  } </br>
                <b>Target user blocked: </b>{
                    "success": false,
                    "statusCode": 2000,
                    "message": "This user is blocked by you."
                  }</br>
                <b>User has blocked you: </b>{
                    "success": false,
                    "statusCode": 2001,
                    "message": "This user has blocked you."
                  }</br>
                <b>Rating request already exists: </b>{
                    "success": false,
                    "statusCode": 1003,
                    "message": "Wait for 60 minutes before request rating from this user again."
                  }</br>
                <b>Rating requested from private user: </b>{
                "success": false,
                "statusCode": 1001,
                "message": "You cannot request rating from a private user."
                }</br>
                <b>Good to know: </b><br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.sendRatingRequest,
            validate: {
                payload: {
                    userId: constants.JOI.USER_ID.required(),
                }
            }
        }
    },

    //Rate a user
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/network/rate',
        config: {
            description: '[app] User wants to rate the other user',
            notes: `<b>Purpose: </b>To rate the other user<br>
                <b>Happy Scenerio Response: </b><br><br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Good to know: <br>User Object: </b></br>    {
                    "id": 1,
                    "firstName": "Jawad",
                    "lastName": "Ali",
                    "image": "29edabd0-6d60-11e8-89b6-09d3badc58a9.jpg",
                    "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                    "location": "Karachi",
                    "indexMultiplier": {
                      "jfIndex": 0,
                      "jfMultiplier": 1,
                      "rateOfChange": 0
                    },
                    "settings": {
                      "isCaptainProfile": false,
                      "acceptRating": false,
                      "acceptAnonymousRating": false
                    },
                    "friendRelation": null
                  }<br>
                  or with 
                  "friendRelation": {
                    "acceptRequest": true,
                    "isSeen": false
                  } where accpetRequest can be true(accepted), false(rejected) and null(not responded)
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.rate,
            validate: {
                payload: {
                  userId: constants.JOI.USER_ID.required(),
                  trait1: Joi.number().integer().min(1).max(5),
                  trait2: Joi.number().integer().min(1).max(5),
                  trait3: Joi.number().integer().min(1).max(5),
                  trait4: Joi.number().integer().min(1).max(5),
                  trait5: Joi.number().integer().min(1).max(5),
                  trait6: Joi.number().integer().min(1).max(5),
                  trait7: Joi.number().integer().min(1).max(5),
                  trait8: Joi.number().integer().min(1).max(5),
                  trait9: Joi.number().integer().min(1).max(5),
                    isAnonymous: Joi.boolean().default(false).required(),
                    date: Joi.date().optional()       // #REMOVE
                }
            }
        }
    },

    // Cancel a Follow Request
    {
        method: 'PUT',
        path: constants.CONFIGS.apiPrefix + '/network/followrequest/cancel',
        config: {
            description: '[app] To cancel a friend request',
            notes: `<b>Purpose: </b>To cancel a friend request<br>
                <b>Happy Scenerio Response: </b><br>
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data deleted from the system successfully."
                }<br>
                <b>Other Responses: </b><br>
                Un-authorized or invalid parameters general response<br>
                {
                    "success": false,
                    "statusCode": 1001,
                    "message": "The request no longer exists."
                }
                <b></b><br></br>
                <b>Good to know: </br></br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.cancelFollowRequest,
            validate: {
                payload: {
                    targetUserId: constants.JOI.USER_ID.required().description('The id of the user to whom the request is sent')
                }
            }
        }
    },
    // Returns facebook ids having JF app installed with pagination
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/network/facebookfriends',
        config: {
            description: '[app] User wants to check which of his facebook friends have JF app installed',
            notes: `<b>Purpose: </b>To get the list of users having jf installed <br>
                <b style="color:red;">Please priortize the search in the existing users first</b><br>
                <b>Happy Scenerio Response: </b><br>{
                    "success": true,
                    "statusCode": 200,
                    "message": "Data retrieved from the system successfully.",
                    "data": []
                  }<br><br>
                  {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data retrieved from the system successfully.",
                    "data": {
                      "existingUsers": [
                        {
                          "id": 12,
                          "firstName": "First Name",
                          "lastName": "Last Name",
                          "facebookId": "string",
                          "image": "string",
                          "indexMultiplier": {
                            "jfIndex": 0,
                            "jfMultiplier": 1,
                            "rateOfChange": 0
                          },
                          "settings": {
                            "isCaptainProfile": false,
                            "acceptRating": false,
                            "acceptAnonymousRating": false
                          },
                          "friendRelation": {
                            "acceptRequest": null,
                            "isSeen": false
                          }
                        }
                      ]
                    }
                  }
                  <br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Good to know: <br>
                  "friendRelation": {
                    "acceptRequest": true,
                    "isSeen": false
                  } where accpetRequest can be true(accepted), false(rejected) and null(not responded)
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.getFacebookFriends,
            validate: {
                payload: {
                    facebookIds: Joi.array().items(
                            constants.JOI.FACEBOOK_ID.required()
                    )
                }
            }
        }
    },

    //Get ratings a user received
    {
        method: 'GET',
        path: constants.CONFIGS.apiPrefix + '/network/ratings',
        config: {
            description: '[app] User wants to see the ratings he/she received',
            notes: `<b>Purpose: </b>To get the list of ratings<br>
                <b>Happy Scenerio Response: </b><br><br>
                {
                    "id": 6,
                    "userId": 4,
                    "fromUserId": 10,
                    "trait1": 21,
                    "trait2": null,
                    "trait3": null,
                    "trait7": 20,
                    "trait8": null,
                    "trait9": null,
                    "trait4": 10,
                    "trait5": null,
                    "trait6": null,
                    "count": null,
                    "isAnonymous": false,
                    "status": 1,
                    "isDeleted": false,
                    "createdAt": "2018-08-28T15:36:44.000Z",
                    "updatedAt": "2018-08-28T15:36:44.000Z",
                    "ratingGivenBy": {
                      "firstName": "Umair",
                      "lastName": "Saeed",
                      "email": "umair@cb.com",
                      "image": "",
                      "status": true,
                      "isDeleted": false
                    }
                },
                </br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: NetworkController.getUserRatings,
            validate: {}
        }
    }
];
