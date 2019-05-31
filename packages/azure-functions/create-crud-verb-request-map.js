'use strict';

/**
 * @param {import("./types").CrudService} crudServices
 * @returns {import("./types").VerbReqMap}
 */
module.exports = function createCrudVerbReqMap(crudServices) {
    return {
        GET: async ({ req, context }) => {
            if (req.params.id) {
                return await crudServices.getById(req.params.id, context);
            }
            const query = crudServices.mapQueryString(req.query);
            return await crudServices.search(query, context);
        },
        POST: async ({ req, context }) => {
            return await crudServices.create(req.body, context);
        },
        PUT: async ({ req, context }) => {
            return await crudServices.replaceById(req.params.id, req.body, context);
        },
        DELETE: async ({ req, context }) => {
            return await crudServices.deleteById(req.params.id, context);
        },
    };
};
