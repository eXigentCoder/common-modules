'use strict';

const IsRequiredError = require(`../is-required-error/is-required-error`);
const KrimZenNinjaBaseError = require(`../krimzen-ninja-base-error`);

module.exports = class ValidationError extends KrimZenNinjaBaseError {
    /**
     * An error used when some input value is not valid
     * @param {string} message The name of the required value
     * @param {object} [errors] The error object containing extra information
     * @param {object} [schema] The schema against which the object was validated
     * @param {object} [data] The data against which the schema was validated
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        message,
        errors,
        schema,
        data,
        { innerError, decorate = {}, safeToShowToUsers = true } = {
            decorate: {},
            safeToShowToUsers: true,
        }
    ) {
        if (!message) {
            throw new IsRequiredError(`message`, `ValidationError`, `constructor`);
        }
        decorate.errors = errors;
        decorate.schema = schema;
        super({
            message,
            name: `ValidationError`,
            codeSuffix: `VALIDATION_FAILED`,
            httpStatusCode: 400,
            decorate,
            innerError,
            safeToShowToUsers,
        });
        this.data = data;
    }
};
