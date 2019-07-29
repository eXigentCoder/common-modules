'use strict';

const express = require('express');
const config = require('../config/config');
const testErrorsRouter = require('../error-handling/error-test-router');
const setupErrorRoutes = require('@bit/exigentcoder.common-modules.express-error-handler');

const errorHandlerOptions = config.get('errorHandling');
const expressOptions = config.get('expressApp');
const router = express.Router(expressOptions.routerOptions);
const healthRoute = require('../health/health-route');
const logTestRoute = require('../logging/log-test-route');
const logger = require('../logging/logger');

module.exports = function(app) {
    app.use(router);
    router.use('/', healthRoute);
    router.use('/logtest', logTestRoute);
    router.use('/error', testErrorsRouter);
    router.post('/report-violation', function logCspViolation(req, res) {
        if (req.body) {
            logger.error('CSP Violation from browser: ', req.body);
        } else {
            logger.error('CSP Violation from browser: No data received!');
        }
        res.status(204).end();
    });
    setupErrorRoutes(app, errorHandlerOptions);
};
