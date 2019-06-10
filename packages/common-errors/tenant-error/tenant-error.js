'use strict';

const IsRequiredError = require(`../is-required-error/is-required-error`);
const KrimZenNinjaBaseError = require(`../krimzen-ninja-base-error`);

module.exports = class TenantError extends KrimZenNinjaBaseError {
    /**
     *Creates an instance of EntityNotFoundError.
     * @param {string} title the title of the tenant type e.g. Team
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        title,
        { innerError, decorate, safeToShowToUsers = true } = {
            safeToShowToUsers: true,
            decorate: {},
        }
    ) {
        if (!title) {
            throw new IsRequiredError(`title`, `TenantError`, `constructor`);
        }
        super({
            message: `The "${title}" identifier was provided.`,
            name: `TenantError`,
            codeSuffix: `TENANT`,
            innerError,
            decorate,
            httpStatusCode: 400,
            safeToShowToUsers: safeToShowToUsers,
        });
    }
};
