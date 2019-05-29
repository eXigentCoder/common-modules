'use strict';

const { methodNotAllowed } = require('@hapi/boom');

/**
 *
 *
 * @param {import('../version-info/types').ExecutionContext} context
 * @param {import('./types').HttpRequest} req
 * @param {import('./types').VerbReqMap} verbReqMap
 * @returns
 */
module.exports = async function runRequestForVerb(context, req, verbReqMap) {
    validateVerbReqMap(verbReqMap);
    const requestsForVerb = verbReqMap[req.method.toUpperCase()];
    if (!requestsForVerb) {
        throw methodNotAllowed(`Method ${req.method} not supported.`);
    }
    return await requestsForVerb({ req, context });
};

/** @param {import('./types').VerbReqMap} verbReqMap */
function validateVerbReqMap(verbReqMap) {
    //todo: Test for if get and GET and GeT are all specified, most likely indicates an error
    Object.keys(verbReqMap).forEach(method => {
        const upperMethod = method.toUpperCase();
        if (method !== upperMethod) {
            verbReqMap[upperMethod] = verbReqMap[method];
            delete verbReqMap[method];
        }
    });
}
