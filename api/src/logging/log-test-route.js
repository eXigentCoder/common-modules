'use strict';
const logger = require('./logger');
module.exports = function(req, res) {
    logger.info('log');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.debug('debug');
    logger.trace('trace');
    res.status(200).send();
};
