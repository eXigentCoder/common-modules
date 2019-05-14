'use strict';

const debug = require('debug')('@exigentcoder/common-modules.express-error-handling');
const { IsRequiredError } = require('../common-errors');
const errorHandler = require('./error-handler');
const boomErrorHandler = require('./boom-error-handler');
const notFound = require('./not-found');

module.exports = function initialise(app, options = {}) {
    debug('Initialising');
    if (!app) {
        throw new IsRequiredError('app');
    }
    options.exposeServerErrorMessages = options.exposeServerErrorMessages || false;
    app.use(errorHandler());
    app.use(boomErrorHandler(options));
    app.use(notFound());
    debug('Initialised');
};
