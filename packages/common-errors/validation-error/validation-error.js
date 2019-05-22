'use strict';

const IsRequiredError = require('../is-required-error/is-required-error');
const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

module.exports = class ValidationError extends KrimZenNinjaBaseError {
    /**
     * An error used when some value that is required was not provided
     * @param {string} message The name of the required value
     * @param {Object} [errors] The error object containing extra information
     * @param {import('../krimzen-ninja-base-error').ErrorParameters} errorOptions
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
        super({
            message,
            name: 'ValidationError',
            codeSuffix: 'VALIDATION_FAILED',
            httpStatusCode: 400,
            decorate: { ...errors, ...decorate },
            innerError,
            safeToShowToUsers,
        });
        if (errors) {
            this.errors = errors;
        }
    }
};
