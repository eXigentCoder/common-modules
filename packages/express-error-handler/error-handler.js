'use strict';
const boom = require('@hapi/boom');
const { KrimZenNinjaBaseError } = require('../common-errors');
module.exports = function errorHandler() {
    return function _errorHandler(err, req, res, next) {
        if (err.isBoom) {
            return next(err);
        }
        if (err instanceof KrimZenNinjaBaseError) {
            if (err.safeToShowToUsers) {
                const boomified = boom.boomify(err, {
                    statusCode: err.httpStatusCode,
                });
                const payload = boomified.output.payload;
                payload.code = err.code;
                payload.name = err.name;
                if (err.decorate) {
                    Object.getOwnPropertyNames(err.decorate).forEach(
                        key => (payload[key] = err.decorate[key])
                    );
                }
                if (err.innerError) {
                    payload.innerErr = err.innerError;
                }
                return next(boomified);
            } else {
                return next(
                    boom.boomify(err, {
                        statusCode: err.httpStatusCode,
                    })
                );
            }
        }
        const statusCode = err.httpStatusCode || err.statusCode || 500;
        if (err instanceof Error) {
            return next(boom.boomify(err, { statusCode }));
        }
        console.warn(`Threw a non Error object; ${err}`);
        if (typeof err === 'string') {
            return next(new boom(err, { statusCode }));
        }
        return next(new boom('Unknown Error', { statusCode, data: err }));
    };
};
