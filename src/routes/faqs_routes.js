'use strict';

const config = require('../configs/config');
const Joi = require('joi');
const FAQsController = require('../controllers/faqs_controller');

const localRouteTag = ['api', 'FAQs'];

module.exports = [
    {
        method: 'POST',
        path: config.apiPrefix + '/faqs',
        config: {
            description: 'Add a faq',
            notes: `<b> Purpose: </b> Add an faq by providing question and answer, and is active, 0 means inactive while 1 stands for active, as 0,1, are mathematical representation of true, false <br>
            <b> Happy Scenario Response: <b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data added into the system successfully."
            }
            <br>
            <b> Other Responses: </b> <br>
            {
                "success": false,
                "statusCode": 409,
                "message": "Record already exists with this information"
            }
            <br>
            <b> Good to know: </b> Dupliucation check on question <br>`,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // scope: ['ADMIN'],
            },
            handler: FAQsController.create,
            plugins: {},
            validate: {
                payload: {
                    question: Joi.string().min(5).required().example('Is this the sample question?'),
                    answer: Joi.string().min(5).required().example('Yes! that was the sample question'),
                    isActive: Joi.number().integer().min(0).max(1).required().example(1),
                }
            }
        }
    },
    {
        method: 'PUT',
        path: config.apiPrefix + '/faqs',
        config: {
            description: 'Updates the faq',
            notes: `<b> Purpose: </b> Updates faq by providing question, answer, isActive and id, 0,1 is the numerical representation of true/false <br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
            } <br>
            <b>Other Responses: </b> 
            {
                "success": false,
                "statusCode": 404,
                "message": "No record found with this ID"
            }<br>
            <br>
            <b>Good to know: </b><br>`,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // scope: ['ADMIN'],
            },
            handler: FAQsController.update,
            plugins: {},
            validate: {
                payload: {
                    id: Joi.number().integer().min(1).required().example(1),
                    question: Joi.string().min(5).required().example('Is this the sample question?'),
                    answer: Joi.string().min(5).required().example('Yes! that was the sample question'),
                    isActive: Joi.number().integer().min(0).max(1).required().example(1)
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: config.apiPrefix + '/faqs',
        config: {
            description: 'Delete FAQ',
            notes: `<b> Purpose: </b> Delete FAQ by providing id [Soft delete] <br>
            <b> Happy Scenario: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data deleted from the system successfully."
            } <br>
            <b> Other Responses: </b> <br>
            {
                "success": false,
                "statusCode": 404,
                "message": "No record found with this ID"
            } <br>
            `,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // scope: ['ADMIN'],
            },
            handler: FAQsController.delete,
            plugins: {},
            validate: {
                payload: {
                    id: Joi.number().integer().min(1).required().example(1),
                }
            }
        }
    },
    {
        method: 'GET',
        path: config.apiPrefix + '/faqs',
        config: {
            description: 'Get all the FAQs with the pagination',
            notes: `<b> Purpose: </b> Get all FAQs with pagination <br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "metadata": {
                  "page": 1,
                  "limit": 10,
                  "count": 2,
                  "totalPages": 1,
                  "totalCount": 2
                },
                "data": [
                  {
                    "id": 3,
                    "question": null,
                    "answer": null,
                    "status": true,
                    "isDeleted": false,
                    "createdAt": "2018-05-24T11:28:17.000Z",
                    "updatedAt": "2018-05-24T11:28:17.000Z",
                    "createdBy": null,
                    "updatedBy": null
                  },
                  {
                    "id": 4,
                    "question": "Is this the sample question?",
                    "answer": "Yes! that was the sample question",
                    "status": true,
                    "isDeleted": false,
                    "createdAt": "2018-05-24T11:31:00.000Z",
                    "updatedAt": "2018-05-24T11:31:00.000Z",
                    "createdBy": null,
                    "updatedBy": null
                  }
                ],
                "success": true,
                "statusCode": 200,
                "message": "Data retrieving successfull"
              } <br>
              <b> Other Responses: </b> <br>
              <b> Good to know: <b> <br>
             `,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // mode: 'optional',
            },
            handler: FAQsController.getAll,
            plugins: {},
            validate: {
                query: {
                    page: Joi.number().integer().min(1).max(1000).required().example(1).description('Page number, Max(1000)'),
                    limit: Joi.number().integer().min(1).max(1000).required().example(5).description('Number of records to fetch, Max(1000)'),
                }
            }
        }
    },
    {
        method: 'PUT',
        path: config.apiPrefix + '/faqs/status',
        config: {
            description: 'Updates the status of faq',
            notes: `<b> Purpose: </b> Updates the status of faq by providing isActive and id, 0,1 is the numerical representation of true/false <br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data updated into the system successfully."
            } <br>
            <b>Other Responses: </b> 
            {
                "success": false,
                "statusCode": 404,
                "message": "No record found with this ID"
            }<br>
            <br>
            <b>Good to know: </b><br>`,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // scope: ['ADMIN'],
            },
            handler: FAQsController.updateStatus,
            plugins: {},
            validate: {
                payload: {
                    id: Joi.number().integer().min(1).required().example(1),
                    isActive: Joi.number().integer().min(0).max(1).required().example(1)
                }
            }
        }
    },
    {
        method: 'GET',
        path: config.apiPrefix + '/faqs/id/{id}',
        config: {
            description: 'Get a specific FAQ by id',
            notes: `<b> Prupose: </b> Get a specific FAQ by id <br>
            <b>Happy Scenerio Response: </b> <br>
            {
                "success": true,
                "statusCode": 200,
                "message": "Data retrieved from the system successfully.",
                "data": {
                  "id": 1,
                  "question": "Is this the sample question?",
                  "answer": "Yes! that was the sample question",
                  "status": true,
                  "isDeleted": true,
                  "createdAt": "2018-05-24T11:28:02.000Z",
                  "updatedAt": "2018-05-24T11:49:09.000Z",
                  "createdBy": null,
                  "updatedBy": null
                }
              } <br>
            <b>Other Responses: </b> 
            {
                "success": false,
                "statusCode": 404,
                "message": "No record found with this ID"
            }<br>
            <br>
            <b>Good to know: </b><br>`,
            tags: localRouteTag,
            auth: {
                // strategy: 'jwt',
                // mode: 'optional',
            },
            handler: FAQsController.getById,
            plugins: {},
            validate: {
                params: {
                    id: Joi.number().integer().min(1).required().example(1),
                }
            }
        }
    },
];
