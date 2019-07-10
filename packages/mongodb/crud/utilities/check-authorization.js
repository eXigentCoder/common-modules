'use strict';

const get = require(`lodash/get`);
const { NotAuthorizedError } = require(`../../../common-errors`);

/**
 * @param {import('casbin').Enforcer} [enforcer] The Casbin enforcer to use with the policies if provided
 * @param {import('../../../entity-metadata/types').EntityMetadata} metadata The entities metadata object
 * @param {import('../../../version-info/types').ExecutionContext} executionContext The execution context for this action
 * @param {string} action the name of the action
 * @param {any} currentEntity The current entity to check ownership against
 * @returns {Promise<void>}
 */
async function checkAuthorization(enforcer, metadata, executionContext, action, currentEntity) {
    if (!metadata.authorization) {
        return;
    }
    const currentUserId = executionContext.identity.id;
    let aclAllowed = false;
    let ownershipAllowed = false;
    let allowed = false;
    if (enforcer) {
        aclAllowed = await enforcer.enforce(currentUserId, metadata.namePlural, action);
    }
    if (metadata.authorization.ownership) {
        let actionAllowed =
            metadata.authorization.ownership.allowedActions.indexOf(action) >= 0 ||
            metadata.authorization.ownership.allowedActions.indexOf(`*`) >= 0;
        let isOwner = get(currentEntity, `owner.id`, ``) === currentUserId;
        ownershipAllowed = actionAllowed && isOwner;
    }
    if (metadata.authorization.interaction === `or`) {
        allowed = aclAllowed || ownershipAllowed;
    } else {
        allowed = aclAllowed && ownershipAllowed;
    }
    if (!allowed) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
}
module.exports = { checkAuthorization };
