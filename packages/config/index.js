'use strict';

const _ = require(`lodash`);
const nconf = require(`nconf`);
const path = require(`path`);
const debug = require(`debug`)(`@exigentcoder/common-modules.config`);

let initialised = false;
const defaultConfigOptions = {
    name: null,
    configPath: ``,
    argvOptions: null,
    envOptions: {
        separator: `_`,
    },
};

/**
 * Initialises nconf using a hierarchy of sources for the source application or script.
 * The priority order for parameters is:
 * * command line arguments (argv).
 * * environment variables.
 * * source code files stored in the ./config folder of your application.
 * Also allows for using nconf.set which will save to memory.
 * @name initialise
 * @param {import('./types').ConfigOptions|string} inputOptions The options used to setup the configuration library.
 */
function initialise(inputOptions) {
    debug(`Initialising configuration with options: %o`, inputOptions);
    if (typeof inputOptions === `string`) {
        inputOptions = {
            name: inputOptions,
        };
    }
    _.defaults(inputOptions, defaultConfigOptions);
    if (!inputOptions.name) {
        throw new Error(`inputOptions.source is required`);
    }
    if (typeof inputOptions.name !== `string`) {
        throw new Error(`Source is required`);
    }
    const internalConfig = {
        NODE_ENV: process.env.NODE_ENV || `development`,
        name: inputOptions.name,
    };
    nconf
        .argv(inputOptions.argvOptions)
        // @ts-ignore
        .env(inputOptions.envOptions)
        .defaults(internalConfig)
        .use(`memory`); //lets us call set later on
    const environment = nconf.get(`NODE_ENV`);
    process.env.NODE_ENV = environment;
    debug(`Environment set to %s`, environment);

    const environmentConfigFromFile = loadConfigFromFile(`config/` + environment, inputOptions);
    const defaultConfigFromFile = loadConfigFromFile(`config/default`, inputOptions);

    _.merge(internalConfig, defaultConfigFromFile, environmentConfigFromFile);
    nconf.defaults(internalConfig);
    debug(`Configuration initialised`);
    initialised = true;
}

function loadConfigFromFile(filePath, options) {
    /* eslint-disable global-require*/
    const envFilePath = path.join(process.cwd(), options.configPath, filePath);
    debug(`Loading config file at %s`, envFilePath);
    let envFile;
    try {
        envFile = require(envFilePath);
    } catch (err) {
        console.warn(err);
        return {};
    }
    const payload = envFile.default || envFile;
    let config;
    if (typeof payload === `function`) {
        config = payload(options);
    } else if (typeof payload === `object`) {
        config = payload;
    } else {
        throw new Error(`Config file at ${filePath} must directly export a function or object`);
    }
    return config;
}

function ensureInitialised(methodName) {
    if (!initialised) {
        throw new Error(`You must call initialise before calling ` + methodName);
    }
}

/**
 * Gets a value out of the config store
 * @name get
 * @param {string} key The unique name of they key for the value
 * @returns {any} The returned value if one existed
 */
function get(key) {
    ensureInitialised(`get`);
    return nconf.get(key);
}

/**
 * Sets a value in the config store, will only exist in memory and will not persist across reboots
 * @name set
 * @param {string} key The unique name of the key to store the value under
 * @param {any} value The value to store, can be any type
 */

function set(key, value) {
    ensureInitialised(`set`);
    return nconf.set(key, value);
}

module.exports = {
    initialise,
    get,
    set,
};
