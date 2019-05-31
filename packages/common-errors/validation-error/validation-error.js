'use strict';

const IsRequiredError = require('../is-required-error/is-required-error');
const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

module.exports = class ValidationError extends KrimZenNinjaBaseError {
    /**
     * An error used when some input value is not valid
     * @param {string} message The name of the required value
     * @param {object} [errors] The error object containing extra information
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        message,
        errors,
        { innerError, decorate = {}, safeToShowToUsers = true } = {
            decorate: {},
            safeToShowToUsers: true,
        }
    ) {
        if (!message) {
            throw new IsRequiredError('errorMessage', 'ValidationError', 'constructor');
        }
        decorate.errors = errors;
        super({
            message,
            name: 'ValidationError',
            codeSuffix: 'VALIDATION_FAILED',
            httpStatusCode: 400,
            decorate,
            innerError,
            safeToShowToUsers,
        });
    }
};
