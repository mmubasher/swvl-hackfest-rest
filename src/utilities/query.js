'use strict';
const models = require('../models');
const Op = models.Sequelize.Op;
const errorUtility = require('../utilities/errorHandling');
const responseUtility = require('../utilities/responseHandling');
const paginationUtility = require('../utilities/pagination');
const statusCodes = require('http-status-codes');
const timeUtility = require('../utilities/time');
const BaseUtility = require('./base');


module.exports = class QueryUtility extends BaseUtility {

    /**
     *
     * @param {*} modelName | Name of the table
     * @param {*} query  | Sequelize Query Object
     * @param {*} options | in case you want to some association etc, else null
     * @param {*} reply | In case you want the automatic generic response after the insetion
     * @param {*} payload | Payload object
     * @param {*} applyAdjustment | if you want to apply adjust (will add the creation and updation time and isDeleted to zero)
     * @param {*} cb
     */
    static applyCreateQuery(modelName, query, options = null, reply = null, payload = null, applyAdjustment = true, cb = null) {
        if (applyAdjustment==true) {
            query.isDeleted = 0;
        }
        models[modelName].create(query, options)
                .then((data) => {
                    if (cb==null) {
                        reply(responseUtility.makeSuccessfullAdditionMessage());
                    } else {
                        return cb(null, data);
                    }
                }, (err) => {
                    if (cb==null) {
                        reply(errorUtility.makeAndLogError(err)).code(500);
                    } else {
                        return cb(err);
                    }
                });
    }


    /**
     *
     * @param {*} modelName | Name of the table
     * @param {*} query | Update Query
     * @param {*} options | Update Options
     * @param {*} reply | In case you want to send the generic update response automatically
     * @param {*} payload
     * @param {*} applyAdjustment | In case you want to apply some basic adjustment, isDeleted = 0 check while updating,
     * @param {*} cb |  If you want to tack the response of the query yourself
     */
    static applyUpdateQuery(modelName, query, options, reply = null, payload = null, applyAdjustment = true, cb = null) {
        if (applyAdjustment==true) {
            options.where.isDeleted = 0;
        }
        models[modelName].update(query, options)
                .then(data => {
                    if (cb==null) {
                        reply(responseUtility.makeSuccessfullUpdationMessage());
                    } else {
                        return cb(null, data);
                    }
                }, err => {
                    if (cb==null) {
                        reply(errorUtility.makeAndLogError(err)).code(500);
                    } else {
                        return cb(err);
                    }
                });
    }

    /**
     *
     * @param {*} value | Value to search for
     * @param {*} modelName | Table/model name
     * @param {*} colName | Coloumn name to search in
     * @param {*} cb | Cb to handle the response with the signature (err,count)=>{}
     */
    static getCount(value, modelName, colName, cb) {
        models[modelName].count({
            where: {
                [colName]: {
                    [Op.eq]: value
                },
                isDeleted: 0
            }
        }).then(data => {
            cb(null, data);
        }, err => {
            cb(err);
        });
    }


    /**
     *
     * @param {*} modelName | Name of the table to apply the find one query
     * @param {*} options | query settings to pass
     * @param {*} reply | if you want the direct reply from here
     * @param {*} payload | In case payload has the id value you want to use
     * @param {*} applyAdjustment | isDeleted = 0, status = 1  and id = payload.id will be applied if adjustment = true;
     * @param {*} cb | with the query cb (err,data)
     */
    static applyFindOneQuery(modelName, options, reply = null, payload = null, applyAdjustment = true, cb) {
        if (applyAdjustment==true) {
            if (options.where==null) {
                options.where = {
                    id: {
                        [Op.eq]: payload.id,
                    },
                    isDeleted: 0,
                    status: 1
                };
            } else {
                options.where.id = {
                    [Op.eq]: payload.id,
                };
                options.where.isDeleted = 0;
                options.where.status = 1;
            }
        }
        models[modelName].findOne(options)
                .then(data => {
                    if (reply!=null) {
                        reply(responseUtility.makeSuccessfullDataMessage(data));
                    } else {
                        return cb(null, data);
                    }
                }, err => {
                    if (reply!=null) {
                        reply(errorUtility.makeError(err)).code(500);
                    } else {
                        return cb(err);
                    }
                });
    }
}
/// functions below are old functions, will keep using them in the above class when ever required,

//Queries Adjustments

const adjustFindQuery = function (query) {
    return query;
};

////////////////////////////////
//////Applying Queries ////////
////////////////////////////////

const applyDeleteQuery = function (modelName, query, options, reply, payload = null, userId = null, applyAdjustment = true) {
    if (applyAdjustment==true) {
        //query
        query.isDeleted = 1;

        //options
        if (payload.id) {
            options.where = {
                id: {
                    [Op.eq]: payload.id,
                },
                isDeleted: 0,
            };
        }
    }
    models[modelName].update(query, options)
            .then((data) => {
                reply(responseUtility.makeSuccessfullDeletionMessage());
            }, (err) => {
                reply(errorUtility.makeAndLogError(err)).code(500);
            });
}

const applyHardDeleteQuery = function (modelName, query, options, reply, payload = null, userId = null, applyAdjustment = true) {
    options.where = {
        id: {
            [Op.eq]: payload.id,
        }
    };
    models[modelName].destroy(options)
            .then((data) => {
                reply(responseUtility.makeSuccessfullDeletionMessage());
            }, (err) => {
                reply(errorUtility.makeAndLogError(err)).code(500);
            });
}

const applyDeleteQueryCallback = function (modelName, query, options, cbs, cbf, payload = null, userId = null, applyAdjustment = true) {
    if (applyAdjustment==true) {
        //query
        query.isDeleted = 1;

        //options
        if (payload.id) {
            options.where = {
                id: {
                    [Op.eq]: payload.id,
                },
                isDeleted: 0,
            };
        }
    }
    models[modelName].update(query, options)
            .then(cbs, cbf);
}

const applyFindOneQuery = function (modelName, options, reply, payload = null, userId = null, applyAdjustment = true) {
    if (applyAdjustment==true) {
        options.where = {
            id: {
                [Op.eq]: payload.id,
            },
            isDeleted: 0
        };
    }
    models[modelName].findOne(options)
            .then((data) => {
                reply(responseUtility.makeSuccessfullDataMessage(data));
            }, (err) => {
                reply(errorUtility.makeAndLogError(err)).code(500);
            });
}

const applyFindOneQueryCallback = function (modelName, options, cbs, cbf, payload = null, userId = null, applyAdjustment = true) {
    if (applyAdjustment==true) {
        options.where = {
            id: {
                [Op.eq]: payload.id,
            },
            isDeleted: 0
        };
    }
    models[modelName].findOne(options)
            .then(cbs, cbf);
}

const applyFindAllQuery = function (modelName, query, options, reply, payload = null, userId = null, applyAdjustment = true) {
    if (applyAdjustment==true) {
        if (options.where!=null) {
            options.where.isDeleted = 0;
        } else {
            options.where = {
                isDeleted: 0
            };
        }
    }
    models[modelName].findAll(options)
            .then(data => {
                reply(responseUtility.makeSuccessfullDataMessage(data));
            }, (err) => {
                reply(errorUtility.makeAndLogError(err)).code(500);
            });
}

const applyFindAllQueryCallback = function (modelName, query, options, reply, payload = null, userId = null, applyAdjustment = true, cbs, cbf) {
    if (applyAdjustment==true) {
        if (options.where!=null) {
            options.where.isDeleted = 0;
        } else {
            options.where = {
                isDeleted: 0
            };
        }
    }
    models[modelName].findAll(options).then(cbs, cbf);
}

/*const applyFindAllQuery = function (modelName, query, options, reply, payload = null, userId = null, applyAdjustment = true) {
    models[modelName].findAll({
        where: {
            isDeleted: 0
        }
    })
        .then(data => {
            reply(responseUtility.makeSuccessfullDataMessage(data));
        }, (err) => {
            reply(errorUtility.makeAndLogError(err)).code(500);
        });
}*/

const applyFindAndCountAllPaginationQuery = function (modelName, options, reply, payload = null, userId = null, applyAdjustment = true) {
    models[modelName].findAndCountAll(options)
            .then((data) => {
                paginationUtility.sendPaginationReply(reply, data);
            }, (err) => {
                reply(errorUtility.makeAndLogError(err)).code(500);
            });
}

const applyFindAndCountAllPaginationQueryCallback = function (modelName, options, reply, cbs, cbf, payload = null, userId = null, applyAdjustment = true) {
    models[modelName].findAndCountAll(options)
            .then(cbs, cbf);
}


const getCountWithoutCurrentId = function (id, modelName, colName, objId, cb) {
    if (cb==null) {
        return models[modelName].count({
            where: {
                [colName]: {
                    [Op.eq]: id
                },
                id: {
                    [Op.ne]: objId
                },
                isDeleted: 0
            }
        });
    } else {
        return models[modelName].count({
            where: {
                [colName]: {
                    [Op.eq]: id
                },
                id: {
                    [Op.ne]: objId
                },
                isDeleted: 0
            }
        }).then((data) => {
            cb(data);
        });
    }

}

/*
module.exports = {
    applyCreateQuery,
    applyCreateQueryCallback,
    applyUpdateQuery,
    applyUpdateQueryCallback,
    applyDeleteQuery,
    applyDeleteQueryCallback,
    applyFindOneQuery,
    applyFindOneQueryCallback,
    applyFindAndCountAllPaginationQuery,
    applyFindAndCountAllPaginationQueryCallback,
    applyFindAllQuery,
    applyFindAllQueryCallback,
    getCount,
    getCountWithoutCurrentId,
    applyHardDeleteQuery,
};*/
