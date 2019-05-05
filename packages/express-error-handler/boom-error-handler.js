'use strict';
const debug = require('debug')('@exigentcoder/common-modules.express-error-handling');
const util = require('util');

module.exports = function boomErrorHandler(options) {
    // eslint-disable-next-line no-unused-vars
    return function boomErrorHandler(err, req, res, next) {
        if (!req.log) {
            debug(
                'req.log was falsy, falling back to console. Make sure you are using express-pino-logger see https://github.com/pinojs/express-pino-logger'
            );
            req.log = console;
        }
        if (err.isServer) {
            req.log.error('Server Error :', util.inspect(err));
        } else {
            req.log.warn('Client Error :', util.inspect(err));
        }
        if ((options.exposeServerErrorMessages && err.isServer) || !err.isServer) {
            const messageToLog = err.output.payload;
            if (err.data) {
                messageToLog.data = err.data;
            }
            messageToLog.errMessage = err.message;
            res
                .status(err.output.statusCode)
                .set(err.output.headers)
                .json(messageToLog);
            return;
        }
        res
            .status(err.output.statusCode)
            .set(err.output.headers)
            .json(err.output.payload);
    };
};
