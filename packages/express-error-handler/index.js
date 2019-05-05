'use strict';

const debug = require('debug')('krimzen-ninja-express-error-handling');
const { IsRequiredError } = require('../common-errors');
const errorHandler = require('./error-handler');
const boomErrorHandler = require('./boom-error-handler');
const notFound = require('./not-found');

module.exports = function initialise(options) {
    debug('Initialising');
    if (!options.name) {
        throw new IsRequiredError('options.name', initialise.name);
    }
    if (!options.app) {
        throw new IsRequiredError('options.app', initialise.name);
    }
    options.exposeServerErrorMessages = options.exposeServerErrorMessages || false;
    options.app.use(errorHandler());
    options.app.use(boomErrorHandler(options));
    options.app.use(notFound());
    debug('Initialised');
};
