'use strict';

module.exports = class IsRequiredError extends Error {
    /**
     * An error used when some value that is required was not provided
     * @param {string} requiredValue The name of the required value
     * @param {string} [functionName] The name of the function where the required value was supposed to be provided too
     */
    constructor(requiredValue, functionName) {
        if (functionName) {
            super(`You must provide "${requiredValue}" to the "${functionName}" function`);
        } else {
            super(`The "${requiredValue}" value is required`);
        }
        this.name = this.constructor.name;
        this.code = 'ERR_KN_IS_REQUIRED';
    }
};
