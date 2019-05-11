'use strict';

const createPino = require('pino');
require('pino-pretty');
const { IsRequiredError } = require('../common-errors');
let _pino;

const consoleMap = {
    fatal: { name: 'fatal' },
    error: { name: 'error' },
    warn: { name: 'warn' },
    log: { name: 'info' },
    info: { name: 'info' },
    debug: { name: 'debug' },
    trace: { name: 'trace' },
};

/**
 * @type Logger
 * @typedef {{name:string,oldFn?:Function}} ConsoleMapValue
 * @typedef {{fatal: ConsoleMapValue, error: ConsoleMapValue, warn: ConsoleMapValue, log: ConsoleMapValue, info: ConsoleMapValue, debug: ConsoleMapValue, trace: ConsoleMapValue}} ConsoleMap
 * @typedef {(options:import('pino').LoggerOptions & {name:string},stream?:import('pino').DestinationStream)=>Logger} Initilaise
 * @typedef {()=>Logger} OverrideConsole
 * @typedef {{ level?: import('pino').Level | string; serializers?: { [key: string]: import('pino').SerializerFn }; [key: string]: any; }} Bindings
 * @typedef {(bindings:Bindings)=>import('pino').Logger} Child
 * @typedef {()=>import('pino').Logger} Pino
 * @typedef {()=>Logger} Reset Clears the old pino logger and unoverrides the console if applicable
 * @typedef {import('pino').Logger & {initilaise: Initilaise, consoleMap: ConsoleMap, overrideConsole: OverrideConsole, child: Child, pino: Pino, reset: Reset}} Logger
 */
const logger = {
    //@ts-ignore
    initialise,
    consoleMap,
    overrideConsole,
    child,
    //@ts-ignore
    pino,
    reset,
};

/**
 * Initialises the wrapper for the pino logger
 * @type {Initilaise}
 */
function initialise(options, stream) {
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
    _pino = createPino(options, stream);
    return logger;
}

/**
 * Uses monkey-patching to override the console methods and map them to the pino methods
 * @type {OverrideConsole}
 */
function overrideConsole() {
    ensureInitialised('overrideConsole');
    Object.getOwnPropertyNames(consoleMap).forEach(function(consoleMethodName) {
        const map = consoleMap[consoleMethodName];
        const pinoMethodName = map.name;
        map.oldFn = console[consoleMethodName];
        console[consoleMethodName] = function() {
            _pino[pinoMethodName].apply(_pino, arguments);
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
 * @type {Child}
 */
function child() {
    ensureInitialised('child');
    return _pino.child.apply(_pino, arguments);
}

/**
 * Returns the underlying [pino logger](https://github.com/pinojs/pino)
 * @type {Pino}
 */
function pino() {
    ensureInitialised('pino');
    return _pino;
}

/**
 *
 * @type {Reset}
 */
function reset() {
    Object.getOwnPropertyNames(consoleMap).forEach(function(consoleMethodName) {
        const map = consoleMap[consoleMethodName];
        if (map.oldFn) {
            console[consoleMethodName] = map.oldFn;
        }
    });
    _pino = undefined;
    return logger;
}

Object.getOwnPropertyNames(consoleMap).forEach(logLevel => {
    logger[logLevel] = function() {
        ensureInitialised(logLevel);
        _pino[logLevel].apply(_pino, arguments);
    };
});

module.exports = logger;
