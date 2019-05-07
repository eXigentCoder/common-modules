'use strict';

const createPino = require('pino');
require('pino-pretty');
const { IsRequiredError } = require('../common-errors');
let _pino;

const consoleMap = {
    fatal: 'fatal',
    error: 'error',
    warn: 'warn',
    log: 'info',
    info: 'info',
    debug: 'debug',
    trace: 'trace',
};

/**
 * @type Logger
 * @typedef {{initialise: initialise, consoleMap: {fatal: string, error: string, warn: string, log: string, info: string, debug: string, trace: string}, overrideConsole: overrideConsole, child: child, pino: pino, reset: reset}} Logger
 */
const logger = {
    initialise,
    consoleMap,
    overrideConsole,
    child,
    pino,
    reset,
};

/**
 * Initialises the wrapper for the pino logger
 * @param {object} options The [pino options](https://github.com/pinojs/pino/blob/HEAD/docs/API.md#parameters) to setup the logger.
 * @param {string} options.name The name of the script/application that you would like to setup logging for
 * @param {boolean|object} [options.prettyPrint] (boolean|object): enables [pino.pretty](#pretty). This is intended for non-production configurations.
 * This may be set to a configuration object as outlined in [pino.pretty](#pretty). Default when `NODE_ENV=production` `false`. Default when `NODE_ENV!=production` `true`.
 * @param {string} [options.level] : one of `'fatal'`, `'error'`, `'warn'`, `'info`', `'debug'`, `'trace'`;
 * also `'silent'` is supported to disable logging. Any other value  defines a custom level and requires supplying a
 * level value via `levelVal`. Default when `NODE_ENV=production` `info`. Default when `NODE_ENV!=production` `trace`.
 * @returns {Logger}
 */
function initialise(options) {
    if (!options) {
        throw new IsRequiredError('options', initialise.name);
    }
    if (!options.name) {
        throw new IsRequiredError('options.name', initialise.name);
    }
    if (process.env.NODE_ENV !== 'production') {
        if (options.prettyPrint === undefined) {
            options.prettyPrint = {
                translateTime: 'SYS:standard',
            };
        }
        if (options.level === undefined) {
            options.level = process.env.LEVEL || 'trace';
        }
    } else {
        if (options.level === undefined) {
            options.level = process.env.LEVEL || 'info';
        }
    }
    _pino = createPino(options);
    return logger;
}

/**
 * Uses monkey-patching to override the console methods and map them to the pino methods
 * @returns {Logger}
 */
function overrideConsole() {
    ensureInitialised('overrideConsole');
    Object.keys(consoleMap).forEach(function(consoleMethod) {
        const pinoMethod = consoleMap[consoleMethod];
        console[consoleMethod] = function() {
            _pino[pinoMethod].apply(_pino, arguments);
        };
    });
    return logger;
}

function ensureInitialised(methodName) {
    if (!_pino) {
        throw new Error('You must call initialise before calling ' + methodName);
    }
}

/**
 * Creates a [child logger](https://github.com/pinojs/pino/blob/HEAD/docs/API.md#child),
 * setting all key-value pairs in `bindings` as properties
 * in the log lines. All serializers will be applied to the given pair.
 * @returns {*}
 */
function child() {
    ensureInitialised('child');
    return _pino.child.apply(_pino, arguments);
}

/**
 * Returns the underlying [pino logger](https://github.com/pinojs/pino)
 * @returns {*}
 */
function pino() {
    ensureInitialised('pino');
    return _pino;
}

function reset() {
    _pino = undefined;
    return logger;
}

Object.keys(consoleMap).forEach(logLevel => {
    logger[logLevel] = function() {
        ensureInitialised(logLevel);
        _pino[logLevel].apply(_pino, arguments);
    };
});

module.exports = logger;
