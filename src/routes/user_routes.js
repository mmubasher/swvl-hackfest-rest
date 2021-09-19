'use strict';

const Joi = require('joi');
const UsersController = require('../controllers/users_controller');

const config = require('../configs/config');
const constants = require('../constants/constants');
const localRouteTag = ['api', 'Users'];

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
        method: 'POST',
        path: config.apiPrefix + '/users/signup',
        config: {
            description: '[APP] Create the new users from a signup',
            notes: `<b>Purpose: </b>User Signup<br>
            <b>Happy Scenerio Response: </b>User object with the authentication token<br>
            <b>Other Responses: </b><br>&#9;Duplicate Email Or Duplicate ID 
            {
                "success": false,
                "statusCode": 304,
                "message": "User already exists with this email id"
            }<br><br>
            Duplicate phone number: {
                "success": false,
                "statusCode": 304,
                "message": "Phone number is already in use."
              }<br><br>
            Bad request: {
                "statusCode": 400,
                "error": "Bad Request",
                "message": "child \"password\" fails because [\"password\" length must be at least 8 characters long]",
                "validation": {
                  "source": "payload",
                  "keys": [
                    "password"
                  ]
                }
              }<br><br>
            Some Internal Crash (Handled): {
                "success": false,
                "statusCode": 500,
                "message": "connect ECONNREFUSED 1270013306"
            }<br><br>
            Server Error (not handled) : Response code will be not 200, as for all the above response code will be 200, status code will differ  
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.signupWithEmail,
            plugins: {
                'hapi-swagger': {
                    order: 1
                }
            },
            validate: {
                payload: {

                    firstName: constants.JOI.FIRST_NAME.required(),
                    lastName: constants.JOI.LAST_NAME.required(),
                    email: constants.JOI.EMAIL.required(),
                    password: constants.JOI.PASSWORD.required(),
                    phoneNumber: constants.JOI.PHONE_NUMBER.required(),
                    image: constants.JOI.IMAGE,

                    /* Not included in business module */
                    /* Default values: false */
                    traitAppearance: Joi.boolean().default(false).required().example(false),
                    traitPersonality: Joi.boolean().default(false).required().example(false),
                    traitIntelligence: Joi.boolean().default(false).required().example(false),
                    traitNone: Joi.boolean().default(false).required().example(false),

                    notificationsEnabled: Joi.boolean().default(false).required().example(false),
                    locationEnabled: Joi.boolean().default(false).required().example(false),
                    isCaptainProfile: Joi.boolean().default(false).example(false),
                    /* Not included in business module */

                    //device info
                    deviceUid: Joi.string().allow(''),
                    deviceToken: Joi.string().allow(''),
                    deviceType: Joi.string().valid('ios', 'android', ''),

                    /*  user_agent: Joi.string(),
                      device_os: Joi.string(),
                      build_version: Joi.string(),*/

                }
            }
        }
    },

    //login user,cmd
    {
        method: 'POST',
        path: config.apiPrefix + '/users/login',
        config: {
            description: '[APP] Login the users into the app',
            notes: `<b>Purpose: </b>User Loging to the application<br>
            <b>Happy Scenerio Response: </b>System will reuturn the User <br>
            <b>Other Responses: </b><br>Internal Server Error {
                "message": "An internal server error occurred",
                "statusCode": 500,
                "error": "Internal Server Error"
              }<br><br>
              Successfull message:  {
                "success": true,
                "statusCode": 200,
                "message": "User login successfull"
                "data" : user profile object,
              }
              <br> <br>
              {
                "success": false,
                "statusCode": 105,
                "message": "Invalid email or password. Please try again."
              }
            <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.loginWithEmail,
            plugins: {
                'hapi-swagger': {
                    order: 5
                }
            },
            validate: {
                payload: {
                    email: constants.JOI.EMAIL.required(),
                    password: constants.JOI.PASSWORD.required(),

                    deviceUid: Joi.string(),
                    deviceToken: Joi.string(),
                    deviceType: Joi.string().valid('ios', 'android'),

                    userAgent: Joi.string().optional(),
                    deviceOs: Joi.string().optional(),
                    buildVersion: Joi.string().optional(),
                }
            }
        }
    },

    //logout deletes the auth token
    {
        method: 'GET',
        path: config.apiPrefix + '/users/logout',
        config: {
            description: '[APP] Logout the user',
            notes: `<b>Purpose: </b>Logouts the user, if the user clicks logout<br>
            <b>Happy Scenerio Response: </b>Makes the auth token invalid for further use, and a success response<br>
            <b>Other Responses: </b><br>Internal Server Error {
                "message": "An internal server error occurred",
                "statusCode": 500,
                "error": "Internal Server Error"
              }<br><br>
              Successfull message:  {
                "success": true,
                "statusCode": 200,
                "message": "User logout successfull"
              }
              <br><br>
            <b>Good to know: </b>User token will not work anymore, token invalid response will be generic to all end points, so in logout if token is valid, it is supposed to be successfull, unless some internal server error <br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.logout,
            plugins: {
                'hapi-swagger': {
                    order: 7
                }
            },
            validate: {}
        }
    },

    //forgotpassword, sends the email
    {
        method: 'POST',
        path: config.apiPrefix + '/users/forgotpassword',
        config: {
            description: '[App] Sends the reset password link to the user on the email provided',
            notes: `<b>Purpose: </b>Will check if the user is valid or not, if valide will send a reset code to the user<br>
            <b>Happy Scenerio Response: </b>Success response and the email to the user<br>
            <b>Other Responses: </b>
            {
                "success": false,
                "statusCode": 105,
                "message": "The email you entered does not belong to any user."
            }
            <br><br>
            <b>Good to know: </b>This is a Step 1 in reset password process<br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.forgotPassword,
            plugins: {
                'hapi-swagger': {
                    order: 10
                }
            },
            validate: {
                payload: {
                    email: constants.JOI.EMAIL.required(),
                }
            }
        }
    },

    //redirect to the mobile from the reset password email
    {
        method: 'GET',
        path: config.apiPrefix + '/users/redirect',
        config: {
            description: '[App] Redirects to the reset password page, and initiates from email',
            notes: `<b>Purpose: </b>Will redirect to the reset password screen<br>
            jvstFamovs://jvstfamovs.com/resetpassword?code=xyz for smart phones <br/>
            jvstFamovs://jvstfamovs.com/resetpassword?code=expired if the code is expired
            <b>Happy Scenerio Response: </b>No response, as this URL is supposed to redirect<br>
            <b>Other Responses: </b><br><br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.redirectToResetPassword,
            plugins: {
                'hapi-swagger': {
                    order: 11
                }
            },
            validate: {
                query: {
                    code: Joi.string(),
                }
            }
        }
    },


    // get the user  profile
    {
        method: 'GET',
        path: config.apiPrefix + '/users/profile',
        config: {
            description: '[App] To get the user profile',
            notes: `<b>Purpose: </b>Will return the user profile<br><br>
            <b>Happy Scenerio Response: </b> {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                    {
                        "id": 5,
                        "firstName": "First Name",
                        "lastName": "Last Name",
                        "fullName": null,
                        "facebookId": null,
                        "email": "abdul.rasheed@citrusbits.com",
                        "image": "string",
                        "biography": "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                        "location": "Patoki",
                        "longitude": null,
                        "latitude": null,
                        "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwic2NvcGUiOlsiVVNFUiJdLCJpYXQiOjE1MzAxNjE3OTYsImV4cCI6MTUzMjc1Mzc5Nn0.4GjqOuCiXY2tr5tWdwryAuZsh_21Tg2XgmQf3gmuNFM",
                        "phoneNumber": "string",
                        "emailVerificationCode": null,
                        "createdAt": "2018-06-11T10:38:29.000Z",
                        "updatedAt": "2018-06-28T04:56:36.000Z",
                        "settings": {
                          "id": 5,
                          "userId": 5,
                          "traitAppearance": true,
                          "traitPersonality": true,
                          "traitIntelligence": true,
                          "traitNone": true,
                          "notificationsEnabled": true,
                          "locationEnabled": true,
                          "scoreScope": "everyone",
                          "isCaptainProfile": false,
                          "acceptAnonymousRating": false,
                          "facebookConnected": false,
                          "displayFacebookProfile": false,
                          "acceptRating": false,
                          "createdAt": "2018-06-11T10:38:29.000Z",
                          "updatedAt": "2018-06-22T12:54:04.000Z"
                        }
                }<br><br>
            <b>Other Responses: </b><br><br>
            <b>Good to know: </b><br><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.getProfile,
            plugins: {
                'hapi-swagger': {
                    order: 20
                }
            }
        }
    },

    //reset password
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/resetpassword',
        config: {
            description: '[Admin] takes the new password, and the code, and change the password',
            notes: `<b>Purpose: </b>To reset the password<br>
            <b>Happy Scenerio Response: </b>Success response with user object<br>
            <b>Other Responses: </b><br><br>
            <b>Good to know: </b>This is a Step 3 in reset password process<br>after password reset, existing tokens will start failing for the user<br>
            `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.resetPassword,
            plugins: {
                'hapi-swagger': {
                    order: 12
                }
            },
            validate: {
                payload: {
                    code: Joi.string().min(5).max(50).required().example('adsfb12e3132454235'),
                    password: constants.JOI.PASSWORD.required(), //if changing also change on the login                   
                }
            }
        }
    },

    //update password
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/changepassword',
        config: {
            description: '[Admin] takes the new password, and the old password, and update the password',
            notes: `<b>Purpose: </b>To update the password<br>
            <b>Happy Scenerio Response: </b>Success response with user object: {
                "success": true,
                "statusCode": 200,
                "message": "Password change successfull",
                "data": {
                  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwic2NvcGUiOlsiVVNFUiJdLCJpYXQiOjE1MjI4MjEyMTEsImV4cCI6MTUyNTQxMzIxMX0.-P8ly4dSNgsrTyIK0XFlwJJMiT3d22HDN4Veq6KOLYM",
                  "id": 4,
                  "firstName": "First Name",
                  "lastName": "Last Name",
                  "email": "citrusbits1@cb.com",
                  "image": "string"
                }
              }<br><br>
            <b>Other Responses: </b>Invalid Password: {
                "success": false,
                "statusCode": 105,
                "message": "The password you entered is incorrect"
              } <br><br>
            <b>Good to know: </b>This is a Step 3 in reset password process<br>after password change, existing tokens will start failing for the user<br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.updatePassword,
            plugins: {
                'hapi-swagger': {
                    order: 13
                }
            },
            validate: {
                payload: {
                    oldPassword: constants.JOI.PASSWORD.required(),
                    newPassword: constants.JOI.PASSWORD.required(),
                }
            }
        }
    },

    //update Profile Image
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/profileimage',
        config: {
            description: '[Admin] Takes the new image name and update it',
            notes: `<b>Purpose: </b>To update the new image<br>
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
            handler: UsersController.updateProfilePicture,
            plugins: {
                'hapi-swagger': {
                    order: 13
                }
            },
            validate: {
                payload: {
                    image: constants.JOI.IMAGE.required()
                }
            }
        }
    },

    //email exists
    {
        method: 'POST',
        path: config.apiPrefix + '/users/emailexists',
        config: {
            description: '[User] Tells that the particular email already exists or not',
            notes: `<b>Purpose: </b>Returns true if email exists otherwise false<br>
            <b>Happy Scenerio Response: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "isExists": true
                }
            }
            <br>
            <b>Other Responses: </b>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "isExists": false
                }
            }
            <br><br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
                mode: 'optional',
            },
            handler: UsersController.emailExists,
            plugins: {
                'hapi-swagger': {
                    order: 15
                }
            },
            validate: {
                payload: {
                    email: constants.JOI.EMAIL.required()
                }
            }
        }
    },
    //Number exists
    {
        method: 'POST',
        path: config.apiPrefix + '/users/phonenumberexists',
        config: {
            description: '[App] Tells that the particular phone number already exists or not',
            notes: `<b>Purpose: </b>To tell the user that phone number already exists<br>
                <b>Happy Scenerio Response: </b> 
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data retrieved from the system successfully.",
                    "data": {
                      "isExists": true
                    }
                  }
                <br>
                <b>Other Responses: </b>
                { "success": false, "statusCode": 200, "message": "Data retrieved from the system successfully.", "data": { "isExists": true } } 
                <br><br>
                <b>Good to know: </b> Phone number should be entered with country code <br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
                mode: 'optional',
            },
            handler: UsersController.phoneNumberExists,
            plugins: {
                'hapi-swagger': {
                    order: 6
                }
            },
            validate: {
                payload: {
                    phoneNumber: constants.JOI.PHONE_NUMBER.required()
                }
            }
        }
    },

    //delete user
    {
        method: 'DELETE',
        path: config.apiPrefix + '/users/delete',
        config: {
            description: '[User] Delete user from the system',
            notes: `<b>Purpose: </b>Delete user from system by providing phone number<br>
                <b>Happy Scenerio Response: </b> 
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data deleted from the system successfully."
                }
                <br>
                <b>Other Responses: </b>
                {
                    "success": false,
                    "statusCode": 105,
                    "message": "No such user exists."
                }
                <br><br>
                <b>Good to know: </b> Phone number should be entered with country code <br>`,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.deleteUser,
            plugins: {},
            validate: {
                payload: {
                    phoneNumber: constants.JOI.PHONE_NUMBER.required()
                }
            }
        }
    },
    //update user
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/update',
        config: {
            description: '[User] Updates the user profile',
            notes: `<b>Purpose: </b>Updates the information of the user profile<br>
                <b>Happy Scenerio Response: </b> 
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data updated into the system successfully."
                }
                <br>
                <b>Other Responses: </b>
                <br><br>
                <b>Good to know: </b> <br>`,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.updateProfile,
            plugins: {
                'hapi-swagger': {
                    order: 8
                }
            },
            validate: {
                payload: {
                    firstName: constants.JOI.FIRST_NAME.required(),
                    lastName: constants.JOI.LAST_NAME.required(),
                    location: Joi.string().example('Patoki').allow('').max(255).trim(),
                    biography: Joi.string().example('Lorem ipsum dolor sit amet, consectetur adipiscing elit').allow('').max(512)
                }
            }
        }
    },

    //update email
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/update/email',
        config: {
            description: '[User] Updates the email id in the user profile',
            notes: `<b>Purpose: </b> Sends verification email to new email id for updating the email id in user profile <br/>
            <b>Happy Scenerio Response: </b> <br/> 
            {
                "success": true,
                "statusCode": 200,
                "message": "Confirmation email is sent successfully."
            }
            <br>
            <b>Other Responses: </b>
            <br><br>
            <b>Good to know: </b> <br>`,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.updateEmail,
            plugins: {
                'hapi-swagger': {
                    order: 9
                }
            },
            validate: {
                payload: {
                    email: constants.JOI.EMAIL.required()
                }
            }
        }
    },

    {
        method: 'GET',
        path: config.apiPrefix + '/users/update/email',
        config: {
            description: '[User] Redirects to the change email confirmation html page or mobile screen',
            notes: `<b>Purpose: </b>Redirects to the change email id confirmation html page for desktop or mobile screen for mobiles<br>
                <b>Happy Scenerio Response: </b> Returns html page that contains confirmation, or in case of mobile, redirects to url <br>
                In case of mobile: <br>
                jvstFamovs://jvstfamovs.com/updateEmail/success for successfully updation of email address,
                jvstFamovs://jvstfamovs.com/updateEmail/invalidVerificationCode for invalid verification code,
                jvstFamovs://jvstfamovs.com/updateEmail/invalidEmail for invalid email
                <br>
                <b>Other Responses: </b> {"statusCode":404,"error":"Not Found","message":"Not Found"}
                <br> {
                    "success": false,
                    "statusCode": 105,
                    "message": "Invalid reset code."
                    }
                <br>
                {
                    "success": false,
                    "statusCode": 304,
                    "message": "Email already in use."
                }
                <br/>
                <b>Good to know: </b><br>
                `,
            tags: localRouteTag,
            auth: false,
            handler: UsersController.redirectToUpdateEmail,
            plugins: {
                'hapi-swagger': {
                    order: 11
                }
            },
            validate: {
                query: {
                    code: Joi.string(),
                    requestedEmail: constants.JOI.EMAIL.required()
                }
            }
        }
    },

    //update phonenumber
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/update/phonenumber',
        config: {
            description: '[User] Updates the phone number',
            notes: `<b>Purpose: </b>Check for duplication, if not found, updates the phone number in the user profile, otherwise returns error<br>
                <b>Happy Scenerio Response: </b> 
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data updated into the system successfully."
                }
                <br>
                <b>Other Responses: </b>
                {
                    "success": false,
                    "statusCode": 304,
                    "message": "Phone number is already in use."
                }
                <br><br>
                <b>Good to know: </b> <br>`,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.updatePhoneNumber,
            plugins: {
                'hapi-swagger': {
                    order: 12
                }
            },
            validate: {
                payload: {
                    phoneNumber: constants.JOI.PHONE_NUMBER
                }
            }
        }
    },
    //verify password
    {
        method: 'POST',
        path: constants.CONFIGS.apiPrefix + '/users/settings/verifypassword',
        config: {
            description: '[app] Verify if password is matched',
            notes: `<b>Purpose: </b> Takes the user password and verify if it matches the current password<br>
                <b>Happy Scenerio Response: </b><br>
                {
                    "success": true,
                    "statusCode": 200,
                    "message": "Data retrieved from the system successfully.",
                    "data": {
                      "matched": true
                    }
                }<br>
                <b>Other Responses: </b> Un-authorized or invalid parameters general response<br>
                <b>Good to know: </b> or same object with "matched": false if password is not matched<br>
                `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER'],
            },
            handler: UsersController.verifyPassword,
            plugins: {
                'hapi-swagger': {
                    order: 3
                }
            },
            validate: {
                payload: {
                    password: Joi.string().required().min(1)
                }
            }
        }
    },
    //update device token
    {
        method: 'PUT',
        path: config.apiPrefix + '/users/update/devicetoken',
        config: {
            description: '[App] Updates the device token',
            notes: `<b>Purpose: To update the device token when required. </b><br>
            <b>Happy Scenerio Response: </b> <br>
            <br>
            <b>Other Responses: </b><br>
            <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER']
            },
            handler: UsersController.updateDeviceToken,
            validate: {
                payload: {
                    deviceToken: Joi.string(),
                }
            }
        }
    },
    {
        method: 'GET',
        path: config.apiPrefix + '/users/graph/user',
        config: {
            description: '[App] Gets the graph of the user',
            notes: `<b>Purpose: To get the graph data
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "id": 4,                  
                  "jfIndex": 0.8333333333333334,
                  "jfMultiplier": 1.0103393975733734,
                  "rateOfChange": 0,
                  "appearanceAverage": 1,
                  "intelligenceAverage": 1.5,
                  "personalityAverage": 0,
                  "appearanceRateOfChange": 100,
                  "intelligenceRateOfChange": 100,
                  "personalityRateOfChange": 0,
                  "status": true,
                  "isDeleted": false,
                  "createdAt": "2018-06-02T09:57:32.000Z",
                  "updatedAt": "2018-06-02T09:57:32.000Z",
                  "graphData": [
                    {
                      "id": 4,
                      "userId": 4,
                      "jfIndex": 0.83333333,
                      "jfMultiplier": 1.0103394,
                      "appearanceAverage": null,
                      "intelligenceAverage": null,
                      "personalityAverage": null,
                      "processingTime": "2018-07-18"
                    }
                  ],
                  "graphDataHourly": [
                    {
                      "id": 283,
                      "jfIndex": 0,
                      "jfMultiplier": 1.01030303030101,
                      "appearanceAverage": 0,
                      "intelligenceAverage": 0,
                      "personalityAverage": 0,
                      "processingTime": null
                    },
                    {
                      "id": 298,
                      "jfIndex": 0,
                      "jfMultiplier": 1.01030303030101,
                      "appearanceAverage": 0,
                      "intelligenceAverage": 0,
                      "personalityAverage": 0,
                      "processingTime": null
                    }
                  ]
                }
              }
            <br>
            <b>Other Responses: </b><br>
            {
                "success": false,
                "statusCode": 1000,
                "message": "No user exists with this Id."
            }
            <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: false, /*{
                strategy: 'jwt',
                scope: ['USER']
            }*/
            handler: UsersController.getGraphForUser,
            validate: {
                query: {
                    userId: constants.JOI.USER_ID.required(),
                }
            }
        }
    },
    {
        method: 'GET',
        path: config.apiPrefix + '/users/mygraph',
        config: {
            description: '[App] Gets the graph of the user',
            notes: `<b>Purpose: To get the graph data
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "id": 4,
                  "userId": 4,
                  "jfIndex": 0.8333333333333334,
                  "jfMultiplier": 1.0103393975733734,
                  "rateOfChange": 0,
                  "appearanceAverage": 1,
                  "intelligenceAverage": 1.5,
                  "personalityAverage": 0,
                  "appearanceRateOfChange": 100,
                  "intelligenceRateOfChange": 100,
                  "personalityRateOfChange": 0,
                  "status": true,
                  "isDeleted": false,
                  "createdAt": "2018-06-02T09:57:32.000Z",
                  "updatedAt": "2018-06-02T09:57:32.000Z",
                  "graphData": [
                    {
                      "id": 4,                      
                      "jfIndex": 0.83333333,
                      "jfMultiplier": 1.0103394,
                      "appearanceAverage": null,
                      "intelligenceAverage": null,
                      "personalityAverage": null,
                      "processingTime": "2018-07-18"
                    }
                  ]
                }
              }
            <br>
            <b>Other Responses: </b><br>
            {
                "success": false,
                "statusCode": 1000,
                "message": "No user exists with this Id."
            }
            <br>
            <b>Good to know: </b><br>
            `,
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER']
            },
            handler: UsersController.getMyGraph
        }
    },
    {
        method: 'GET',
        path: '/api/users/indexdetail',
        config: {
            description: '[App]Get the user detail regarding jf index...',
            notes: 'Get the user detail regarding jfindex multiplier etc. ',
            tags: localRouteTag,
            auth: {
                strategy: 'jwt',
                scope: ['USER']
            },
            handler: UsersController.getIndexData,
            plugins: {},
            validate: {}
        }
    }
];
