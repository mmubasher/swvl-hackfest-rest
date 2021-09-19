"use strict";

const BaseController = require("./base_controller");
const ResponseUtility = require("../utilities/responseHandling");
const QueryUtility = require("../utilities/query");
const ErrorUtility = require("../utilities/errorHandling");
const PaginationUtility = require("../utilities/pagination");
const UsersController = require("./users_controller");
const TimeUtility = require("../utilities/time");
const JFIndexController = require("./jf_index_controller");

const constants = require("../constants/constants");
const async = require("async");
const models = require("../models");
const Op = models.Sequelize.Op;
const col = models.Sequelize.col;

module.exports = class NetworkController extends BaseController {
  /**
   * Sends the friend request to the userId provided
   * @param {*} request
   * @param {*} reply
   */
  static sendFollowRequest(request, reply) {
    let funcs = {};
    let targetUserId = request.payload.userId;
    funcs.notFollowingSelf = (cb) => {
      if (request.decoded.id == targetUserId) {
        cb(null, false);
        return;
      }
      cb(null, true);
    };

    funcs.getUser = (notFollowingSelf, cb) => {
      if (notFollowingSelf == false) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          id: targetUserId,
          status: 1,
          isDeleted: 0,
        },
        include: [
          {
            model: models[constants.MODELS.JF_USERS_SETTINGS],
            as: "settings",
          },
        ],
      };

      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        null,
        cb
      );
    };

    funcs.targetBlocked = (getUser, cb) => {
      if (getUser == false || getUser == null) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: request.decoded.id,
          reportUserId: targetUserId,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.followerBlocked = (getUser, cb) => {
      if (getUser == false || getUser == null) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: targetUserId,
          reportUserId: request.decoded.id,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.alreadyFollowed = function (
      getUser,
      targetBlocked,
      followerBlocked,
      cb
    ) {
      if (
        getUser == false ||
        getUser == null ||
        targetBlocked == true ||
        followerBlocked == true
      ) {
        cb(null, false);
        return;
      }

      models[constants.MODELS.JF_FRIENDS]
        .count({
          where: {
            userId: targetUserId,
            friendUserId: request.decoded.id,
            // acceptRequest: 1,
            isDeleted: 0,
          },
        })
        .then(
          (data) => {
            cb(null, data > 0);
          },
          (err) => {
            cb(err);
          }
        );
    };

    funcs.followRequestAlreadyExist = (
      getUser,
      notFollowingSelf,
      alreadyFollowed,
      cb
    ) => {
      if (
        notFollowingSelf == false ||
        getUser == false ||
        getUser == null ||
        alreadyFollowed == true
      ) {
        cb(null, false);
        return;
      }

      if (getUser.settings.isCaptainProfile == true) {
        cb(null, false); // we want to send false to disable this check
        return;
      }

      models[constants.MODELS.JF_FRIENDS]
        .count({
          where: {
            userId: targetUserId,
            friendUserId: request.decoded.id,
            isDeleted: 0,
          },
        })
        .then(
          (data) => {
            cb(null, data > 0);
          },
          (err) => {
            cb(err);
          }
        );
    };

    funcs.addFollowRequest = (
      getUser,
      targetBlocked,
      followerBlocked,
      notFollowingSelf,
      alreadyFollowed,
      followRequestAlreadyExist,
      cb
    ) => {
      if (
        getUser == null ||
        getUser == false ||
        targetBlocked == true ||
        followerBlocked == true ||
        notFollowingSelf == false ||
        alreadyFollowed == true ||
        followRequestAlreadyExist == true
      ) {
        cb(null, false);
        return;
      }

      let query = {
        userId: request.payload.userId,
        friendUserId: request.decoded.id,
        isSeen: 0,
        //acceptRequest: true
      };

      if (getUser.settings.isCaptainProfile == true) {
        // query.acceptRequest = true;
      }

      QueryUtility.applyCreateQuery(
        constants.MODELS.JF_FRIENDS,
        query,
        null,
        null,
        null,
        true,
        cb
      );
    };

    funcs.createInAppNotification = (addFollowRequest, cb) => {
      if (addFollowRequest == false) {
        cb(null, false);
        return;
      }
      let query = {
                userId: request.payload.userId,
                fromUserId: request.decoded.id,
                isSeen: 0,
                notificationType: constants.NOTIFICATION_TYPES.FOLLOW_REQUEST
            }
            QueryUtility.applyCreateQuery(constants.MODELS.JF_NOTIFICATIONS, query, null, null, null, true, cb);
    };

    funcs.getCurrentUser = (addFollowRequest, cb) => {
      if (addFollowRequest == false) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          id: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
      };
      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        false,
        cb
      );
    };

    funcs.processJFIndex = (getUser, addFollowRequest, cb) => {
      if (getUser.settings.isCaptainProfile == true) {
        JFIndexController.incrementFollowerOrConnection(request.decoded.id);
        JFIndexController.incrementFollowerOrConnection(request.payload.userId);
      }
      cb(null, true);
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.notFollowingSelf == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1001,
            "You can't friend yourself.",
            false
          )
        );
      } else if (results.getUser == false || results.getUser == null) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_EXISTS,
            constants.MESSAGES.INVALID_NOUSER,
            false
          )
        );
      } else if (results.targetBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.TARGET_BLOCKED,
            "User is blocked, you cannot friend them.",
            false
          )
        );
      } else if (results.followerBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.USER_BLOCKED,
            "You are blocked by this user, you cannot friend them.",
            false
          )
        );
      } else if (results.alreadyFollowed == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            1002,
            "You are already following this user.",
            false
          )
        );
      } else if (results.followRequestAlreadyExist == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.EXISTS,
            "Follow request already exist.",
            false
          )
        );
      } else if (results.addFollowRequest.acceptRequest == 1) {
        reply(
          ResponseUtility.makeSuccessfullAdditionMessage(
            constants.MESSAGES.FOLLOW_SUCCESSFUL
          )
        );
      } else {
        reply(
          ResponseUtility.makeSuccessfullAdditionMessage(
            constants.MESSAGES.FOLLOW_REQUEST_SUCCESSFUL
          )
        );
      }
    });
  }

  static _intersectArray(array1, array2) {
    return array1.filter((value) => -1 !== array2.indexOf(value));
  }

  /**
   * Paginated list of the discover accounts
   * @param {*} request
   * @param {*} reply
   */
  static discover(request, reply) {
    let funcs = {};

    // funcs.blockedByUserIds = (cb) => {
    //     NetworkController._getBlockedByUserIds(request.decoded.id, cb);
    // }

    // funcs.blockedUserIds = (cb) => {
    //     NetworkController._getBlockedUserIds(request.decoded.id, cb);
    // }

    let payload = request.query;
    let searchString = `%${payload.search}%`;
    let anyFilterApplied = false;

    
    funcs.getUserIdsAfterSimpleFilters = (cb) => {
      let userSettingsWhereClause = {};
      let ratedByMeFlag = false;

      if (payload.peopleRatedByMe == true) {
        // as it can be null, which will also become false{}
        ratedByMeFlag = true;
        anyFilterApplied = true;
      }

      if (payload.search != "" && payload.search != null) {
        anyFilterApplied = true;
      }

      if (anyFilterApplied == false) {
        cb(null, false);
        return;
      }

      let options = {
        where: {
          [Op.or]: [
            {
              firstName: {
                [Op.like]: searchString,
              },
            },
            {
              lastName: {
                [Op.like]: searchString,
              },
            },
            models.Sequelize.where(
              models.Sequelize.fn(
                "concat",
                models.Sequelize.col("firstName"),
                " ",
                models.Sequelize.col("lastName")
              ),
              {
                like: searchString,
              }
            ),
          ],
        },
        attributes: ["id"],
        include: [
          {
            model: models[constants.MODELS.JF_USERS_SETTINGS],
            as: "settings",
            attributes: [],
            required: true,
            where: userSettingsWhereClause,
          },
          {
            model: models[constants.MODELS.JF_RATINGS],
            as: "ratingGivenRelation",
            attributes: [],
            where: {
              fromUserId: request.decoded.id,
            },
            required: ratedByMeFlag,
          },
        ],
      };

      models[constants.MODELS.JF_USERS].findAll(options).then(
        (data) => {
          cb(null, NetworkController._makeArray(data));
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.getUsers = (
      getUserIdsAfterSimpleFilters,
      cb
    ) => {
      const options = {};
      const offset = PaginationUtility.getOffset(
        request.query.page,
        request.query.limit
      );

      options.offset = offset;
      options.limit = request.query.limit;

      let userIdsArray = getUserIdsAfterSimpleFilters;

      

      if (userIdsArray == -1) {
        options.where = {
          isDeleted: 0,
          id: {
            [Op.ne]: request.decoded.id,
          },
        };
      } else {
        options.where = {
          isDeleted: 0,
          id: {
            [Op.ne]: request.decoded.id,
            [Op.in]: userIdsArray,
          },
        };
      }

      options.attributes = [
        "id",
        "firstName",
        "lastName",
        "image",
        "location",
        "biography",
      ]; // Location and biography is temporary.. Revert back in next sprint

      if (
        payload.sorting == "alphabaticalAscending" ||
        payload.sorting == "alphabaticalDescending"
      ) {
        let direction = "ASC";
        if (payload.sorting == "alphabaticalDescending") {
          direction = "DESC";
        }
        options.order = [
          ["firstName", direction],
          ["lastName", direction],
        ];
      } else if (
        payload.sorting == "indexAscending" ||
        payload.sorting == "indexDescending"
      ) {
        let direction = "ASC";
        if (payload.sorting == "indexDescending") {
          direction = "DESC";
        }
        options.order = models.sequelize.literal(
          `(indexMultiplier.jfIndex * indexMultiplier.jfMultiplier) ${direction} `
        );
      }

      options.include = [
        {
          model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
          as: "indexMultiplier",
          attributes: [
            "jfIndex",
            "jfMultiplier",
            "rateOfChange",
            "appearanceAverage",
            "intelligenceAverage",
            "personalityAverage",
          ],
        },
        {
          model: models[constants.MODELS.JF_USERS_SETTINGS],
          as: "settings",
          attributes: [
            "isCaptainProfile",
            "acceptRating",
            "acceptAnonymousRating"
          ],
        },
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendRelation",
          attributes: ["id"],
          where: {
            friendUserId: request.decoded.id,
            isDeleted: 0,
          },
          required: false,
        },
        {
          model: models[constants.MODELS.JF_REPORT_USERS],
          as: "reportedByMe",
          attributes: ["id", "userId", "reportUserId"],
          where: {
            userId: request.decoded.id,
            isDeleted: 0,
          },
          required: false,
        },
        {
          model: models[constants.MODELS.JF_REPORT_USERS],
          as: "reportedByThem",
          attributes: ["id", "userId", "reportUserId"],
          where: {
            reportUserId: request.decoded.id,
            isDeleted: 0,
          },
          required: false,
        },
      ];

      models[constants.MODELS.JF_USERS].findAndCountAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        //reply(ErrorUtility.makeError(err));
        ErrorUtility.makePaginatedError(reply, err);
      } else if (results.getUsers == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.FAILED,
            "Something gone wrong",
            false
          )
        );
      } else if (results.getUsers != false) {
        PaginationUtility.sendPaginationReply(reply, results.getUsers);
      }
    });
  }

  /**
   * To get the users, user is following
   * @param {*} request
   * @param {*} reply
   */
  static following(request, reply) {
    let funcs = {};

    funcs.getFriendIds = (cb) => {
      NetworkController._getFriendsByIds(request.decoded.id, cb);
    }

    funcs.getUsers = (getFriendIds, cb) => {
      const ids = getFriendIds.map(temp => temp.id);
      const options = {};
      const offset = PaginationUtility.getOffset(
        request.query.page,
        request.query.limit
      );

      options.offset = offset;
      options.limit = request.query.limit;

      options.where = {
        isDeleted: 0,
        id: {
          [Op.ne]: request.decoded.id,
          [Op.in]: ids
        },
      };

      options.attributes = ["id", "firstName", "lastName", "image"];

      options.order = models.sequelize.literal(
        `(indexMultiplier.jfIndex * indexMultiplier.jfMultiplier) DESC `
      );

      options.include = [
        {
          model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
          as: "indexMultiplier",
          attributes: ["jfIndex", "jfMultiplier", "rateOfChange"],
        },
        {
          model: models[constants.MODELS.JF_USERS_SETTINGS],
          as: "settings",
          attributes: [
            "isCaptainProfile",
            "acceptRating",
            "acceptAnonymousRating",
          ],
        },
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendRelation",
          attributes: ["acceptRequest", "isSeen"],
          where: {
            [Op.or]: {
              friendUserId: request.decoded.id,
              userId: request.decoded.id
            },            
            acceptRequest: true,
            isDeleted: 0
          },
          required: false,
        },
      ];

      models[constants.MODELS.JF_USERS].findAndCountAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        ErrorUtility.makePaginatedError(reply, err);
        //reply(ErrorUtility.makeError(err));
      } else if (results.getUsers == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.FAILED,
            "Something gone wrong",
            false
          )
        );
      } else if (results.getUsers != false) {
        PaginationUtility.sendPaginationReply(reply, results.getUsers);
      }
    });
  }

  /**
   * To get the users, user is following or is followed by
   * @param {*} request
   * @param {*} reply
   */
  static network(request, reply) {
    let funcs = {};

    
    funcs.getUsers = (
      cb
    ) => {
      //cb(null, true);
      const options = {};
      const offset = PaginationUtility.getOffset(
        request.query.page,
        request.query.limit
      );

      options.offset = offset;
      options.limit = request.query.limit;

      options.where = {
        isDeleted: 0,
        id: {
          [Op.ne]: request.decoded.id,
        },
      };

      options.distinct= 'id';

      options.attributes = ["id", "firstName", "lastName", "image"];

      options.order = models.sequelize.literal(
        `(indexMultiplier.jfIndex * indexMultiplier.jfMultiplier) DESC `
      );

      options.include = [
        {
          model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
          as: "indexMultiplier",
          attributes: ["jfIndex", "jfMultiplier", "rateOfChange"],
        },
        {
          model: models[constants.MODELS.JF_USERS_SETTINGS],
          as: "settings",
          attributes: [
            "isCaptainProfile",
            "acceptRating",
            "acceptAnonymousRating",
          ],
        },
        /** uncomment the code below if user wants to see who is followed and who is following */
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendRelation",
          attributes: ["acceptRequest", "isSeen"],
          where: {
            friendUserId: request.decoded.id,
            //acceptRequest: true,
            isDeleted: 0,
          },
          required: false,
        },
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendsWithRelation",
          attributes: ["acceptRequest", "isSeen"],
          where: {
            userId: request.decoded.id,
            //acceptRequest: true,
            isDeleted: 0,
          },
          required: false,
        },
      ];

      models[constants.MODELS.JF_USERS].findAndCountAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        ErrorUtility.makePaginatedError(reply, err);
      } else if (results.getUsers == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.FAILED,
            "Something gone wrong",
            false
          )
        );
      } else if (results.getUsers != false) {
        PaginationUtility.sendPaginationReply(reply, results.getUsers);
      }
    });
  }

  /**
   * Returns a promise
   * @param {*} userId
   */
  static _getFollowingOrFollowedByIds(userId) {
    let rawQuery = `SELECT DISTINCT(jf_users.id) FROM jf_users 
        
        INNER JOIN jf_followers ON
        (jf_users.id = jf_followers.userId OR jf_users.id = jf_followers.fromUserId)        
        AND
        (jf_followers.userId = ${userId} OR jf_followers.fromUserId = ${userId}) 
        AND        
        jf_followers.isDeleted = 0
        WHERE jf_users.id != ${userId} AND acceptRequest = 1
        `;

    let options = {
      type: models.sequelize.QueryTypes.SELECT,
    };

    return models.sequelize.query(rawQuery, options);
  }

  static _getFriendsByIds(userId, cb) {
    let rawQuery = `SELECT DISTINCT(jf_users.id) FROM jf_users 
        
        INNER JOIN jf_friends ON
        (jf_users.id = jf_friends.userId OR jf_users.id = jf_friends.friendUserId)        
        AND
        (jf_friends.userId = ${userId} OR jf_friends.friendUserId = ${userId}) 
        AND        
        jf_friends.isDeleted = 0
        WHERE jf_users.id != ${userId} AND acceptRequest = 1
        `;

    let options = {
      type: models.sequelize.QueryTypes.SELECT,
    };

    models.sequelize.query(rawQuery, options).then(
      (data) => {
        cb(null, data);
      },
      (err) => {
        cb(err);
      }
    );
  }

  /**
   *
   * @param {*} input
   * @param {*} colName  default value id
   */
  static _makeArray(input, colName = "id") {
    let output = [];
    for (let temp in input) {
      output.push(input[temp][colName]);
    }
    return output;
  }

  /**
   * To get the profile of some user
   * @param {*} request
   * @param {*} reply
   */
  static getUserProfile(request, reply) {
    let funcs = {};
    let userId = request.query.userId;

    funcs.userExists = (cb) => {
      UsersController._userExists(userId, cb);
    };
    // funcs.userNotBlock = (cb) => {
    //     cb(null, true);
    // }
    // funcs.userHasNotBlock = (cb) => {
    //     cb(null, true);
    // }

    funcs.getProfileRatingButtonInfo = (userExists, cb) => {
      if (userExists == false) {
        cb(null, false);
        return;
      }
      NetworkController._getProfileRatingInfo(userId, request.decoded.id, cb);
    };

    funcs.getProfileRequestButtonInfo = (userExists, cb) => {
      if (userExists == false) {
        cb(null, false);
        return;
      }
      NetworkController._getProfileRequestButtonInfo(
        userId,
        request.decoded.id,
        cb
      );
    };

    funcs.getProfile = (userExists, cb) => {
      if (userExists == false) {
        cb(null, false);
        return;
      }
      NetworkController._getUserProfile(userId, request.decoded.id, cb);
    };

    funcs.finalResponse = (
      getProfile,
      getProfileRequestButtonInfo,
      getProfileRatingButtonInfo,
      cb
    ) => {
      if (
        getProfile == false ||
        getProfileRatingButtonInfo == false ||
        getProfileRequestButtonInfo == false
      ) {
        cb(null, false);
        return;
      }
      let responseObject = Object.assign({}, getProfile.dataValues);
      responseObject.rateButtonInfo = getProfileRatingButtonInfo;
      responseObject.requestButtonInfo = getProfileRequestButtonInfo;
      cb(null, responseObject);
    };

    async.autoInject(funcs, (err, results) => {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.userExists == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_FOUND,
            "No user exists with this ID.",
            false
          )
        );
      } else if (results.finalResponse) {
        reply(
          ResponseUtility.makeSuccessfullDataMessage(results.finalResponse)
        );
      }
    });
  }

  static _getProfileRequestButtonInfo(userId, fromUserId, cb) {
    const options = {
      where: {
        notificationType: {
          [Op.in]: ["ratingRequested", "ratingRequestedAgain"],
        },
        userId: userId,
        fromUserId: fromUserId,
        status: 1,
        isDeleted: 0,
      },
    };

    options.order = [["createdAt", "DESC"]];

    options.attributes = ["isSeen", "seenAt", ["createdAt", "lastActionTime"]];

    models[constants.MODELS.JF_NOTIFICATIONS].findOne(options).then(
      (data) => {
        cb(null, data);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static _getProfileRatingButtonInfo(userId, fromUserId, cb) {
    const options = {};

    options.where = {
      userId: userId,
      fromUserId: fromUserId,
      status: 1,
      isDeleted: 0,
    };

    options.attributes = [["updatedAt", "lastActionTime"], "count"];

    options.order = [["createdAt", "DESC"]];

    models[constants.MODELS.JF_RATINGS].findOne(options).then(
      (data) => {
        cb(null, data);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static _getUserProfile(userId, fromUserId, cb) {
    const options = {};

    options.where = {
      id: userId,
    };

    options.attributes = [
      "id",
      "firstName",
      "lastName",
      "facebookId",
      "fbProfileLink",
      "image",
      "biography",
      "location",
      "longitude",
      "latitude",
    ];

    options.include = [
      {
        model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
        as: "indexMultiplier",
        attributes: ["jfIndex", "jfMultiplier", "rateOfChange"],
      },
      {
        model: models[constants.MODELS.JF_MULTIPLIER_INFO],
        as: "multiplierInfo",
        attributes: ["ratingsReceived", "ratingsGiven", "ratingsRequested"],
      },
      {
        model: models[constants.MODELS.JF_USERS_SETTINGS],
        as: "settings",
        attributes: [
          "isCaptainProfile",
          "acceptRating",
          "acceptAnonymousRating",
          "facebookConnected",
          "displayFacebookProfile",
          "locationEnabled",
        ],
      },
      {
        model: models[constants.MODELS.JF_FRIENDS],
        as: "friendRelation",
        attributes: ["acceptRequest"],
        where: {
          friendUserId: fromUserId,
          isDeleted: 0
        },
        required: false,
      },
      {
        model: models[constants.MODELS.JF_REPORT_USERS],
        as: "reportedByMe",
        attributes: ["id", "userId", "reportUserId"],
        where: {
          userId: fromUserId,
          isDeleted: 0,
        },
        required: false,
      },
      {
        model: models[constants.MODELS.JF_REPORT_USERS],
        as: "reportedByThem",
        attributes: ["id", "userId", "reportUserId"],
        where: {
          reportUserId: fromUserId,
          isDeleted: 0,
        },
        required: false,
      },
    ];

    models[constants.MODELS.JF_USERS].findOne(options).then(
      (data) => {
        cb(null, data);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static declineFollowRequest(request, reply) {
    const query = {
      acceptRequest: false,
      isDeleted: 1,
    };
    const options = {
      where: {
        id: request.payload.requestId,
        userId: request.decoded.id,
        isDeleted: 0,
      },
    };
    QueryUtility.applyUpdateQuery(
      constants.MODELS.JF_FRIENDS,
      query,
      options,
      reply,
      null,
      false
    );
  }

  static unFollowRequest(request, reply) {
    let funcs = {};
    const userId = request.payload.userId;

    funcs.userExists = (cb) => {
      UsersController._userExists(userId, cb);
    };

    /** no need to check you are already following or not, as it will not effect anything if the user is not following already*/
    funcs.unfollowUser = (userExists, cb) => {
      console.log(1)
      if (userExists == false) {
        cb(null, false);
        return;
      }
      const query = {
        isDeleted: 1,
      };
      const options = {
        where: {
          acceptRequest: true,
          userId: userId,
          friendUserId: request.decoded.id,
          isDeleted: 0,
        },
      };
      QueryUtility.applyUpdateQuery(
        constants.MODELS.JF_FRIENDS,
        query,
        options,
        null,
        null,
        false,
        cb
      );
    };

    async.autoInject(funcs, (err, results) => {
      if (err) {
        console.log(err);
        reply(ErrorUtility.makeError(err));
      } else if (results.userExists == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_FOUND,
            "No user exists with this ID.",
            false
          )
        );
      } else {
        const rowsEffected = results.unfollowUser[0];
        if (rowsEffected == 0) {
          reply(
            ResponseUtility.makeResponseMessage(
              1001,
              "You are not following the user.",
              false
            )
          );
        } else {
          reply(
            ResponseUtility.makeResponseMessage(
              constants.RESPONSE_CODES.OK,
              "User has been successfully unfollowed.",
              true
            )
          );
          JFIndexController.decrementFollowerOrConnection(request.decoded.id);
          JFIndexController.decrementFollowerOrConnection(userId);
        }
      }
    });
  }

  static acceptFollowRequest(request, reply) {
    let funcs = {};
    funcs.followerStillExists = (cb) => {
      QueryUtility.getCount(
        request.payload.userId,
        constants.MODELS.JF_USERS,
        "id",
        cb
      );
    };

    funcs.followerNotBlocked = (followerStillExists, cb) => {
      if (followerStillExists == false) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: request.decoded.id,
          reportUserId: request.payload.userId,
          status: 1,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data == 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.acceptRequest = (followerStillExists, followerNotBlocked, cb) => {
      if (followerNotBlocked == false || followerStillExists == false) {
        cb(null, false);
        return;
      }
      const query = {
        acceptRequest: true,
      };
      const options = {
        where: {
          id: request.payload.requestId,
          userId: request.decoded.id,
          acceptRequest: null,
          isDeleted: 0,
        },
      };
      QueryUtility.applyUpdateQuery(
        constants.MODELS.JF_FRIENDS,
        query,
        options,
        null,
        null,
        false,
        cb
      );
    };

    funcs.creatInAppNotification = (acceptRequest, cb) => {
      cb(null, true);
    };

    funcs.createPushNotification = (acceptRequest, cb) => {
      cb(null, true);
    };

    funcs.JFIndexProcessing = (acceptRequest, cb) => {
      if (acceptRequest == false) {
        cb(null, false);
        return;
      }
      JFIndexController.incrementFollowerOrConnection(request.decoded.id);
      JFIndexController.incrementFollowerOrConnection(request.payload.userId);
      cb(null, true);
    };

    async.autoInject(funcs, (err, results) => {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.followerStillExists == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_FOUND,
            "The user no longer exists.",
            false
          )
        );
      } else if (results.followerNotBlocked == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1002,
            "The user is blocked by you.",
            false
          )
        );
      } else if (results.acceptRequest != false) {
        reply(ResponseUtility.makeSuccessfullUpdationMessage());
      }
    });
  }

  /**
   * Paginated list of contacts having JF
   * @param {*} request
   * @param {*} reply
   */
  static getContacts(request, reply) {
    let funcs = {};

    funcs.getUsers = (cb) => {
      const options = {};
      options.where = {
        isDeleted: 0,
        [Op.or]: {
          phoneNumber: {
            [Op.in]: request.payload.contacts,
          },
          email: {
            [Op.in]: request.payload.contacts,
          },
        },
      };

      options.attributes = [
        "id",
        "firstName",
        "lastName",
        "phoneNumber",
        "email",
        "image",
      ];

      options.include = [
        {
          model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
          as: "indexMultiplier",
          attributes: ["jfIndex", "jfMultiplier", "rateOfChange"],
        },
        {
          model: models[constants.MODELS.JF_USERS_SETTINGS],
          as: "settings",
          attributes: [
            "isCaptainProfile",
            "acceptRating",
            "acceptAnonymousRating",
          ],
        },
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendRelation",
          attributes: ["acceptRequest", "isSeen"],
          where: {
            friendUserId: request.decoded.id,
            isDeleted: 0,
          },
          required: false,
        },
      ];

      models[constants.MODELS.JF_USERS].findAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.getInvities = (cb) => {
      let options = {
        where: {
          isDeleted: 0,
          [Op.or]: {
            phoneNumber: {
              [Op.in]: request.payload.contacts,
            },
            email: {
              [Op.in]: request.payload.contacts,
            },
          },
          invitedBy: request.decoded.id,
        },
        attributes: ["phoneNumber", "email"],
        };
        cb(null, []);
      /*models[constants.MODELS.JF_INVITATIONS].findAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );*/
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else {
        let output = {};
        output.existingUsers =
          results.getUsers == false ? [] : results.getUsers;
        output.invitedUsers =
          results.getInvities == false ? [] : results.getInvities;
        reply(ResponseUtility.makeSuccessfullDataMessage(output));
      }
    });
  }

  /**
   * Sends the rating request to another user
   * @param {*} request
   * @param {*} reply
   */
  static sendRatingRequest(request, reply) {
    let targetUserId = request.payload.userId;
    let funcs = {};

    funcs.notRatingSelf = (cb) => {
      if (request.decoded.id == targetUserId) {
        cb(null, false);
        return;
      }
      cb(null, true);
    };

    funcs.getUser = (cb) => {
      let options = {
        where: {
          id: targetUserId,
          status: 1,
          isDeleted: 0,
        },
        include: [
          {
            model: models[constants.MODELS.JF_USERS_SETTINGS],
            as: "settings",
          },
        ],
      };
      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        false,
        cb
      );
    };

    funcs.targetBlocked = (getUser, cb) => {
      if (getUser == null || getUser == false) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: request.decoded.id,
          reportUserId: targetUserId,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.userBlocked = (getUser, cb) => {
      if (getUser == null || getUser == false) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: targetUserId,
          reportUserId: request.decoded.id,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

  
    funcs.isNotFollowing = (cb) => {
      models[constants.MODELS.JF_FRIENDS]
        .count({
          where: {
            userId: targetUserId,
            friendUserId: request.decoded.id,
            isDeleted: 0,
          },
        })
        .then(
          (data) => {
            cb(null, data == 0);
          },
          (err) => {
            cb(err);
          }
        );
    };

    funcs.requestingRatingAgain = (
      getUser,
      isNotFollowing,
      cb
    ) => {
      if (
        getUser == null ||
        getUser == false ||
        (isNotFollowing == true)
      ) {
        cb(null, false);
        return;
      }
      models[constants.MODELS.JF_NOTIFICATIONS]
        .count({
          where: {
            userId: targetUserId,
            fromUserId: request.decoded.id,
            notificationType: {
              [Op.in]: [
                constants.NOTIFICATION_TYPES.RATING_REQUESTED,
                constants.NOTIFICATION_TYPES.RATING_REQUESTED_AGAIN,
              ],
            },
            isDeleted: 0,
          },
        })
        .then(
          (data) => {
            cb(null, data > 0);
          },
          (err) => {
            cb(err);
          }
        );
    };

    funcs.noExistingRatingRequest = (
      getUser,
      isNotFollowing,
      requestingRatingAgain,
      cb
    ) => {
      if (
        getUser == null ||
        getUser == false ||
        (isNotFollowing == true)
      ) {
        cb(null, false);
        return;
      }

      /*
            Find all rating requests from the user from last 1 hour in descending order but count only one
            Descending order is necessary to get latest rating request
            */
      if (requestingRatingAgain == false) {
        cb(null, true);
        return;
      }
      let timeCondition = 3600;
      if (
        constants.CONFIGS.code_environment == "DEV" ||
        constants.CONFIGS.code_environment == "QA"
      ) {
        timeCondition = 1;
      }
      models[constants.MODELS.JF_NOTIFICATIONS]
        .count({
          where: {
            userId: targetUserId,
            fromUserId: request.decoded.id,
            notificationType: {
              [Op.in]: [
                constants.NOTIFICATION_TYPES.RATING_REQUESTED,
                constants.NOTIFICATION_TYPES.RATING_REQUESTED_AGAIN,
              ],
            },
            createdAt: {
              [Op.between]: [
                TimeUtility.earlyTimeUTC(timeCondition),
                TimeUtility.earlyTimeUTC(0),
              ], // 1 hour before from current time
            },
            isDeleted: 0,
          },
        })
        .then(
          (data) => {
            cb(null, data < 1);
          },
          (err) => {
            cb(err);
          }
        );
    };

    funcs.addRatingRequest = (
      getUser,
      targetBlocked,
      userBlocked,
      noExistingRatingRequest,
      requestingRatingAgain,
      cb
    ) => {
      if (
        getUser == null ||
        getUser == false ||
        targetBlocked == true ||
        userBlocked == true ||
        noExistingRatingRequest == false
      ) {
        cb(null, false);
        return;
      }
      let query = {
        userId: request.payload.userId,
        fromUserId: request.decoded.id,
        notificationType:
          requestingRatingAgain == true
            ? constants.NOTIFICATION_TYPES.RATING_REQUESTED_AGAIN
            : constants.NOTIFICATION_TYPES.RATING_REQUESTED,
        jfMultiplier: 1.0,
        isSeen: 0,
      };
      QueryUtility.applyCreateQuery(
        constants.MODELS.JF_NOTIFICATIONS,
        query,
        null,
        null,
        null,
        true,
        cb
      );
    };

    funcs.createInAppNotification = (
      addRatingRequest,
      requestingRatingAgain,
      cb
    ) => {
      if (addRatingRequest == false) {
        cb(null, false);
        return;
      }

      cb(null, true);
    };

    funcs.getCurrentUser = (addRatingRequest, cb) => {
      if (addRatingRequest == false) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          id: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
      };
      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        false,
        cb
      );
    };

    funcs.processJFIndex = (addRatingRequest, cb) => {
      if (addRatingRequest == false) {
        cb(null, false);
        return;
      }
      JFIndexController.incrementRatingRequest(request.decoded.id);
      cb(null, true);
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.notRatingSelf == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1000,
            "You can't rate yourself.",
            false
          )
        );
      } else if (results.getUser == false || results.getUser == null) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_EXISTS,
            "This user no longer exists.",
            false
          )
        );
      } else if (results.targetBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.TARGET_BLOCKED,
            constants.MESSAGES.TARGET_BLOCKED,
            false
          )
        );
      } else if (results.userBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.USER_BLOCKED,
            constants.MESSAGES.USER_BLOCKED,
            false
          )
        );
      } else if (
        results.isTargetNotPrivate == false &&
        results.isNotFollowing == true
      ) {
        reply(
          ResponseUtility.makeResponseMessage(
            1001,
            "You cannot request rating from a private user.",
            false
          )
        );
      } else if (results.noExistingRatingRequest == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1003,
            constants.MESSAGES.NOT_REQUEST_AGAIN_YET,
            false
          )
        );
      } else {
        reply(
          ResponseUtility.makeSuccessfullAdditionMessage(
            constants.MESSAGES.RATIING_REQUEST_SUCCESSFUL
          )
        );
      }
    });
  }

  static _getBlockedByUserIds(userId, cb) {
    const options = {
      where: {
        reportUserId: userId,
        status: 1,
        isDeleted: 0,
      },
      attributes: [[models.sequelize.fn("DISTINCT", col("userId")), "userId"]],
    };
    models[constants.MODELS.JF_REPORT_USERS].findAll(options).then(
      (data) => {
        let blockedByUserIds = NetworkController._makeArray(data, "userId");
        cb(null, blockedByUserIds);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static _getBlockedUserIds(userId, cb) {
    const options = {
      where: {
        userId: userId,
        status: 1,
        isDeleted: 0,
      },
      attributes: [
        [models.sequelize.fn("DISTINCT", col("reportUserId")), "reportUserId"],
      ],
    };
    models[constants.MODELS.JF_REPORT_USERS].findAll(options).then(
      (data) => {
        let blockedUserIds = NetworkController._makeArray(data, "reportUserId");
        cb(null, blockedUserIds);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static rate(request, reply) {
    let targetUserId = request.payload.userId;
    let funcs = {};
    const traitsPayload = request.payload;

    funcs.getUser = (cb) => {
      let options = {
        where: {
          id: targetUserId,
          status: 1,
          isDeleted: 0,
        },
      };
      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        false,
        cb
      );
    };

    funcs.notRatingSelf = (getUser, cb) => {
      if (getUser == null || getUser == false) {
        cb(null, false);
        return;
      }

      if (request.decoded.id == targetUserId) {
        cb(null, false);
        return;
      }
      cb(null, true);
    };

    funcs.targetBlocked = (getUser, notRatingSelf, cb) => {
      if (getUser == null || getUser == false || notRatingSelf == false) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: request.decoded.id,
          reportUserId: targetUserId,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.userBlocked = (getUser, cb) => {
      if (getUser == null || getUser == false) {
        cb(null, false);
        return;
      }
      const options = {
        where: {
          userId: targetUserId,
          reportUserId: request.decoded.id,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_REPORT_USERS].count(options).then(
        (data) => {
          cb(null, data > 0);
        },
        (err) => {
          cb(err);
        }
      );
    };

    funcs.previousRatingsIfAny = (targetBlocked, userBlocked, cb) => {
      if (targetBlocked == true || userBlocked == true) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          userId: targetUserId,
          fromUserId: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
        attributes: {
          exclude: ["status", "isDeleted", "createdAt", "updatedAt"],
        },
        order: [["createdAt", "DESC"]],
      };
      models[constants.MODELS.JF_RATINGS].findOne(options).then((data) => {
        data = data == null ? null : data.toJSON();
        cb(null, data);
      }, cb);
    };

    funcs.notRecentlyRated = (targetBlocked, userBlocked, cb) => {
      if (targetBlocked == true || userBlocked == true) {
        cb(null, false);
        return;
      }

      let options = {
        where: {
          userId: targetUserId,
          fromUserId: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
        attributes: ["updatedAt"],
        order: [["createdAt", "DESC"]],
      };
      models[constants.MODELS.JF_RATINGS].findOne(options).then(
        (data) => {
          let response = data == null ? null : data.dataValues.updatedAt;
          let updatedDate = new Date(response);
          let timeCondition = 3600;
          if (
            constants.CONFIGS.code_environment == "DEV" ||
            constants.CONFIGS.code_environment == "QA"
          ) {
            timeCondition = 1;
          }
          let limiteDate = new Date(
            TimeUtility.earlyTimeUTCWithoutReplacement(timeCondition)
          );
          if (response == null) {
            cb(null, true);
            return;
          }
          if (updatedDate > limiteDate) {
            cb(null, false);
            return;
          }
          cb(null, response);
        },
        (err) => {
          cb(err);
        }
      );
    };

    
    funcs.isAcceptingRatings = function ( cb) {
      cb(null, true);
    };

    
    
    funcs.addRating = (
      notRecentlyRated,
      previousRatingsIfAny,
      cb
    ) => {
      
      let query = {
        userId: targetUserId,
        fromUserId: request.decoded.id,
        isAnonymous: request.payload.isAnonymous,
        status: 1,
        isDeleted: 0,
      };

      if (request.payload.date != null) {
        query.createdAt = request.payload.date;
      }

      let jfIndexTraitIntelligence = null;
      let jfIndexTraitPersonality = null;
      let jfIndexTraitAppearance = null;

      query.trait1 = traitsPayload.trait1;
      query.trait2 = traitsPayload.trait2;
      query.trait3 = traitsPayload.trait3;
      query.trait4 = traitsPayload.trait4;
      query.trait5 = traitsPayload.trait5;
      query.trait6 = traitsPayload.trait6;
      query.trait7 = traitsPayload.trait7;
      query.trait8 = traitsPayload.trait8;
      query.trait9 = traitsPayload.trait9;
    
      /*JFIndexController.updateTraitRatings(
        targetUserId,
        jfIndexTraitAppearance,
        jfIndexTraitPersonality,
        jfIndexTraitIntelligence,
        previousRatingsIfAny,
        notRecentlyRated,
        getUserSettingsAndRelations
      );*/

      let options = {
        where: {
          userId: targetUserId,
          fromUserId: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
      };

      if (notRecentlyRated == true) {
        models[constants.MODELS.JF_RATINGS].create(query).then(
          (data) => {
            cb(null, true);
          },
          (err) => {
            cb(err);
          }
        );
      } else {
        models[constants.MODELS.JF_RATINGS].update(query, options).then(
          (data) => {
            cb(null, true);
          },
          (err) => {
            cb(err);
          }
        );
      }
    };

    funcs.processJFIndex = (addRating, cb) => {
      if (addRating == false) {
        cb(null, false);
        return;
      }
      JFIndexController.incrementRatingGiven(request.decoded.id);
      JFIndexController.incrementRatingRecieved(targetUserId);
      if (request.payload.isAnonymous == true) {
        JFIndexController.providedAnonymousRating(request.decoded.id, true);
      }
      cb(null, true);
    };

    funcs.createInAppNotification = (addRating, processJFIndex, cb) => {
      if (addRating == false) {
        cb(null, false);
        return;
      }
      JFIndexController.updateJFIndexUser(
        request.payload.userId,
        (err, userDetail) => {
          if (err != null) {
            cb(null, true);
            return;
          }
          let query = {
            userId: request.payload.userId,
            fromUserId: request.decoded.id,
            isSeen: 0,
            jfMultiplier: userDetail.jfMultiplier,
            jfIndex: userDetail.jfIndex,
            notificationType: request.payload.isAnonymous
              ? constants.NOTIFICATION_TYPES.ANONYMOUS_RATED
              : constants.NOTIFICATION_TYPES.USER_RATED,
          };
          QueryUtility.applyCreateQuery(
            constants.MODELS.JF_NOTIFICATIONS,
            query,
            null,
            null,
            null,
            true,
            cb
          );
        }
      );
    };

    funcs.getCurrentUser = (addRating, cb) => {
      if (addRating == false) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          id: request.decoded.id,
          status: 1,
          isDeleted: 0,
        },
      };
      QueryUtility.applyFindOneQuery(
        constants.MODELS.JF_USERS,
        options,
        null,
        null,
        false,
        cb
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.getUser == false || results.getUser == null) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.NOT_EXISTS,
            "This user no longer exists.",
            false
          )
        );
      } else if (results.notRatingSelf == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1000,
            "You can't rate yourself.",
            false
          )
        );
      } else if (results.targetBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.TARGET_BLOCKED,
            constants.MESSAGES.TARGET_BLOCKED,
            false
          )
        );
      } else if (results.userBlocked == true) {
        reply(
          ResponseUtility.makeResponseMessage(
            constants.RESPONSE_CODES.USER_BLOCKED,
            constants.MESSAGES.USER_BLOCKED,
            false
          )
        );
      } else if (results.notRecentlyRated == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1003,
            constants.MESSAGES.NOT_RATE_AGAIN_YET,
            false
          )
        );
      } else if (results.isAcceptingRatings == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1004,
            constants.MESSAGES.NOT_ACCEPTING_RATINGS,
            false
          )
        );
      } else if (results.isTargetPrivateAndFollowed == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1001,
            "You cannot rate a private user.",
            false
          )
        );
      } else if (results.isAcceptingAnonymousRatings == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1005,
            constants.MESSAGES.NOT_ACCEPTING_ANONYMOUS_RATINGS,
            false
          )
        );
      } else if (results.validateRating == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1006,
            constants.MESSAGES.INVALID_RATINGS,
            false
          )
        );
      } else {
        reply(
          ResponseUtility.makeSuccessfullAdditionMessage(
            constants.MESSAGES.USER_RATED_SUCCESSFUL
          )
        );
      }
    });
  }

  static cancelFollowRequest(request, reply) {
    let funcs = {};
    funcs.requestExist = (cb) => {
      let options = {
        where: {
          userId: request.payload.targetUserId,
          friendUserId: request.decoded.id,
          acceptRequest: null,
          isDeleted: 0,
        },
      };
      models[constants.MODELS.JF_FRIENDS].find(options).then((requestObj) => {
        if (requestObj != null) {
          cb(null, requestObj);
          return;
        }
        cb(null, false);
      });
    };

    funcs.cancelRequest = function (requestExist, cb) {
      if (requestExist == false || requestExist == null) {
        cb(null, false);
        return;
      }
      let options = {
        where: {
          id: requestExist.id,
        },
        force: true,
      };
      models[constants.MODELS.JF_FRIENDS]
        .destroy(options)
        .then((isDeleted) => {
          if (isDeleted == true) {
            cb(null, true);
            return;
          }
          cb(null, false);
        })
        .catch((err) => {
          cb(err, false);
        });
    };

    async.autoInject(funcs, (err, results) => {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else if (results.requestExist == false) {
        reply(
          ResponseUtility.makeResponseMessage(
            1001,
            "The request no longer exists.",
            false
          )
        );
      } else if (results.cancelRequest == true) {
        reply(ResponseUtility.makeSuccessfullDeletionMessage());
      }
    });
  }

  static _getProfileRatingInfo(userId, fromUserId, cb) {
    const options = {
      where: {
        userId: userId,
        fromUserId: fromUserId,
        status: 1,
        isDeleted: 0,
      },
      attributes: [
        "trait1",
        "trait2",
        "trait3",
        "trait4",
        "trait5",
        "trait6",
        "trait7",
        "trait8",
        "trait9",
        "isAnonymous",
        ["updatedAt", "lastActionTime"],
        "count",
      ],
    };

    models[constants.MODELS.JF_RATINGS].findOne(options).then(
      (data) => {
        if (data != null) {
          let record = data.dataValues;

          let traitAppearance = [];
          let traitIntelligence = [];
          let traitPersonality = [];

          if (record.trait1 != null) {
            traitAppearance.push(record.trait1);
          }
          if (record.trait2 != null) {
            traitAppearance.push(record.trait2);
          }
          if (record.trait3 != null) {
            traitAppearance.push(record.trait3);
          }

          if (record.trait4 != null) {
            traitIntelligence.push(record.trait4);
          }
          if (record.trait5 != null) {
            traitIntelligence.push(record.trait5);
          }
          if (record.trait6 != null) {
            traitIntelligence.push(record.trait6);
          }

          if (record.trait7 != null) {
            traitPersonality.push(record.trait7);
          }
          if (record.trait8 != null) {
            traitPersonality.push(record.trait8);
          }
          if (record.trait9 != null) {
            traitPersonality.push(record.trait9);
          }

          delete record.trait1;
          delete record.trait2;
          delete record.trait3;

          delete record.trait4;
          delete record.trait5;
          delete record.trait6;

          delete record.trait7;
          delete record.trait8;
          delete record.trait9;

          record.traitAppearance = traitAppearance;
          record.traitIntelligence = traitIntelligence;
          record.traitPersonality = traitPersonality;
          cb(null, data);
          return;
        }
        cb(null, null);
      },
      (err) => {
        cb(err);
      }
    );
  }

  static getFacebookFriends(request, reply) {
    let funcs = {};

    funcs.getUsers = (cb) => {
      const options = {};
      options.where = {
        isDeleted: 0,
        facebookId: {
          [Op.in]: request.payload.facebookIds,
        },
      };

      options.attributes = [
        "id",
        "firstName",
        "lastName",
        "facebookId",
        "image",
      ];

      options.include = [
        {
          model: models[constants.MODELS.JF_INDEX_MULTIPLIER],
          as: "indexMultiplier",
          attributes: ["jfIndex", "jfMultiplier", "rateOfChange"],
        },
        {
          model: models[constants.MODELS.JF_USERS_SETTINGS],
          as: "settings",
          attributes: [
            "isCaptainProfile",
            "acceptRating",
            "acceptAnonymousRating",
          ],
        },
        {
          model: models[constants.MODELS.JF_FRIENDS],
          as: "friendRelation",
          attributes: ["acceptRequest", "isSeen"],
          where: {
            friendUserId: request.decoded.id,
            isDeleted: 0,
          },
          required: false,
        },
      ];

      models[constants.MODELS.JF_USERS].findAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else {
        let output = {};
        output.existingUsers =
          results.getUsers == false ? [] : results.getUsers;
        reply(ResponseUtility.makeSuccessfullDataMessage(output));
      }
    });
  }

  static getUserRatings(request, reply) {
    let funcs = {};
    funcs.getRatings = (cb) => {
      let options = {
        where: {
          userId: request.decoded.id,
          status: true,
          isDeleted: false,
        },
        include: [
          {
            model: models[constants.MODELS.JF_USERS],
            as: "ratingGivenBy",
            where: {
              status: true,
            },
            attributes: [
              "firstName",
              "lastName",
              "email",
              "image",
              "status",
              "isDeleted",
            ],
          },
        ],
      };

      models[constants.MODELS.JF_RATINGS].findAll(options).then(
        (data) => {
          cb(null, data);
        },
        (err) => {
          cb(err);
        }
      );
    };

    async.autoInject(funcs, function (err, results) {
      if (err) {
        reply(ErrorUtility.makeError(err));
      } else {
        reply(ResponseUtility.makeSuccessfullDataMessage(results.getRatings));
      }
    });
  }

  static _makePushNotificationPayload(
    fcmToken,
    firstName,
    lastName,
    notificationType,
    data = null,
    isPushNotificationEnabled = true,
    badgeCount
  ) {
    console.log("-");
    console.log(badgeCount);
    let message = {};
    message.token = `${fcmToken}`;

    if (data != null) {
      message.data = data;
    }

    if (isPushNotificationEnabled == true) {
      let userName = "";
      let title = "";
      let body = "";

      if (
        notificationType == constants.NOTIFICATION_TYPES.USER_RATED ||
        notificationType == constants.NOTIFICATION_TYPES.ANONYMOUS_RATED
      ) {
        userName =
          notificationType == constants.NOTIFICATION_TYPES.USER_RATED
            ? firstName + " " + lastName
            : "Someone";
        title = "You are rated";
        body = `${userName} has rated you`;
      } else if (
        notificationType == constants.NOTIFICATION_TYPES.RATING_REQUESTED
      ) {
        userName = firstName + " " + lastName;
        title = "Rating requested";
        body = `${userName} requested a rating from you`;
      } else if (
        notificationType == constants.NOTIFICATION_TYPES.RATING_REQUESTED_AGAIN
      ) {
        userName = firstName + " " + lastName;
        title = "Rating requested again";
        body = `${userName} requested a rating from you`;
      } else if (
        notificationType == constants.NOTIFICATION_TYPES.INVITE_ACCEPTED
      ) {
        userName = firstName + " " + lastName;
        title = "Invite accepted";
        body = `${userName} has accepted your invite`;
      } else if (
        notificationType == constants.NOTIFICATION_TYPES.FOLLOW_REQUEST
      ) {
        userName = firstName + " " + lastName;
        title = "Follow request received";
        body = `${userName} has sent you a friend request`;
      }

      let notification = {};
      notification.title = title;
      notification.body = body;
      console.log(badgeCount);
      message.apns = {
        payload: {
          aps: {
            badge: badgeCount,
          },
        },
      };
      //notification.badge = badgeCount;
      //console.log(notification);
      message.notification = notification;
    }
    //console.log(message);
    return message;
  }
};
