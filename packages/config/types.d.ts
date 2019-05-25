export interface ConfigOptions {
    /** The name of the source application initialising the configuration. */
    name: string;
    /** The optional path to the `config` folder. Usually this would be `cwd/config` where `cwd` is the current working directory from node's `process.cwd`. */
    configPath?: string;
    /** The yargs options to pass in */
    argvOptions?: any;
    /** Options for using process.env */
    envOptions?: string[] | string | EnvOptions;
}

type KeyValuePair = { [key: string]: string };

export interface EnvOptions {
    /** Specifies how to conver env variables to nested JSON */
    separator?: string;
    /** A regex used to whitelist values from env */
    match?: RegExp;
    /** A collection of properties obtainable from env */
    whitelist?: string[];
    /** Specifies if variables should be lowercased */
    lowerCase?: boolean;
    /** Specifies if common values should be parsed to their types, e.g. numbers and booleans */
    parseValues?: boolean;
    /** A function which will recieve the values and can then transform them */
    transform?: (obj: KeyValuePair) => KeyValuePair;
}
