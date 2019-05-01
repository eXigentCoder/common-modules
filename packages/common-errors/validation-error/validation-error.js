'use strict';
const IsRequiredError = require('../is-required-error/is-required-error');
module.exports = class ValidationError extends Error {
    /**
     * An error used when some value that is required was not provided
     * @param {string} errorMessage The name of the required value
     * @param {object} [errors] The error object containing extra information
     */
    constructor(errorMessage, errors) {
        if (!errorMessage) {
            throw new IsRequiredError('errorMessage', 'ValidationError', 'constructor');
        }
        super(errorMessage);
        if (errors) {
            this.errors = errors;
        }
        this.name = this.constructor.name;
        this.code = 'ERR_KN_VALIDATION_FAILED';
    }
};
