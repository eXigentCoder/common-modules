'use strict';

const pinoDebug = require('pino-debug');
const consoleDest = require('./logging/console-destination');
// @ts-ignore
pinoDebug(require('pino')({ level: 'trace' }, consoleDest));

const config = require('./config/config');
const logger = require('./logging/logger');
const util = require('util');

util.inspect.defaultOptions.showHidden = false;
util.inspect.defaultOptions.depth = 10;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = { config, logger };
