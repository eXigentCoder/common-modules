'use strict';

const IsRequiredError = require(`../is-required-error/is-required-error`);
const KrimZenNinjaBaseError = require(`../krimzen-ninja-base-error`);

module.exports = class NotAuthorizedError extends KrimZenNinjaBaseError {
    /**
     * An error used when some input value is not valid
     * @param {string} identity The name of the required value
     * @param {string} resource The name of the required value
     * @param {string} action The name of the required value
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        identity,
        resource,
        action,
        { innerError, decorate = {}, safeToShowToUsers = true } = {
            decorate: {},
            safeToShowToUsers: true,
        }
    ) {
        if (!identity) {
            throw new IsRequiredError(`identity`, `NotAuthorizedError`, `constructor`);
        }
        if (!resource) {
            throw new IsRequiredError(`resource`, `NotAuthorizedError`, `constructor`);
        }
        if (!action) {
            throw new IsRequiredError(`action`, `NotAuthorizedError`, `constructor`);
        }
        super({
            message: `"${identity}" is not authorized to perform "${action}" on "${resource}"`,
            name: `NotAuthorizedError`,
            codeSuffix: `NOT_AUTHORIZED`,
            httpStatusCode: 403,
            decorate,
            innerError,
            safeToShowToUsers,
        });
    }
};
