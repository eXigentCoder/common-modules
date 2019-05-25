'use strict';

const IsRequiredError = require('../is-required-error/is-required-error');
const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

module.exports = class EntityNotFoundError extends KrimZenNinjaBaseError {
    /**
     *Creates an instance of EntityNotFoundError.
     * @param {string} entityName The user facing name (title) of the entity, e.g. for your users entities this would be User
     * @param {string} id The identifier that was used to find the entity but was not successful
     * @param {import('../types').ErrorParameters} errorOptions
     */
    constructor(
        entityName,
        id,
        { innerError, decorate, safeToShowToUsers = true } = {
            safeToShowToUsers: true,
            decorate: {},
        }
    ) {
        if (!entityName) {
            throw new IsRequiredError('entityName', 'EntityNotFoundError', 'constructor');
        }
        if (!id) {
            throw new IsRequiredError('id', 'EntityNotFoundError', 'constructor');
        }
        super({
            message: `The "${entityName}" with an id of "${id}" was not found.`,
            name: 'EntityNotFoundError',
            codeSuffix: 'ENTITY_NOT_FOUND',
            innerError,
            decorate,
            httpStatusCode: 404,
            safeToShowToUsers: safeToShowToUsers,
        });
    }
};
