'use strict';

const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

module.exports = class IsRequiredError extends KrimZenNinjaBaseError {
    /**
     * An error used when some value that is required was not provided
     * @param {string} requiredValue The name of the required value
     * @param {string} [functionName] The name of the function where the required value was supposed to be provided too
     * @param {string} [functionType] Specifies if the function was a function or constructor
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        requiredValue,
        functionName,
        functionType = 'function',
        { innerError, decorate, safeToShowToUsers = false } = {
            safeToShowToUsers: false,
            decorate: {},
        }
    ) {
        if (!requiredValue) {
            throw new IsRequiredError('requiredValue', 'IsRequiredError', 'constructor');
        }
        let message;
        if (functionName) {
            message = `You must provide "${requiredValue}" to the "${functionName}" ${
                functionType
            }.`;
        } else {
            message = `The "${requiredValue}" value is required`;
        }
        super({
            message,
            name: 'IsRequiredError',
            codeSuffix: 'IS_REQUIRED',
            decorate,
            innerError,
            httpStatusCode: 500,
            safeToShowToUsers,
        });
    }
};
