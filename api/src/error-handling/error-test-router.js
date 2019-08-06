'use strict';

const express = require(`express`);
const config = require(`../config/config`);
const routerOptions = config.get(`expressApp`).routerOptions;
const router = express.Router(routerOptions);
const boom = require(`@hapi/boom`);

const uncaughtErrorMessage = `Testing the uncaught process error, should kill the server, don't expose on live`;

module.exports = router;
if (config.get(`errorHandling`).exposeErrorRoutes) {
    router.get(`/server`, function(req, res, next) {
        return next(
            boom.badImplementation(`Server error - should not see details`)
        );
    });

    router.get(`/client`, function(req, res, next) {
        return next(boom.badRequest(`Client error - should see details`));
    });

    router.get(`/process`, function() {
        process.nextTick(function() {
            throw new Error(uncaughtErrorMessage);
        });
    });
}
module.exports._uncaughtErrorMessage = uncaughtErrorMessage;
