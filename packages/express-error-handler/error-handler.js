'use strict';
const boom = require('@hapi/boom');
const _ = require('lodash/lang');

module.exports = function errorHandler() {
    return function _errorHandler(err, req, res, next) {
        if (err.isBoom) {
            return next(err);
        }
        if (err.toBoom) {
            return next(err.toBoom());
        }
        const statusCode = err.statusCode || 500;
        if (_.isError(err)) {
            return next(boom.boomify(err, { statusCode }));
        }
        if (_.isString(err)) {
            return next(new boom(err, { statusCode }));
        }
        //err
        return next(new boom('Error', { statusCode, data: err }));
    };
};
