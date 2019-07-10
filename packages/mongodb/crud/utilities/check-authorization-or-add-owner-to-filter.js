'use strict';

const { NotAuthorizedError } = require(`../../../common-errors`);

async function checkAuthorizationOrAddOwnerToFilter(
    filter,
    enforcer,
    metadata,
    executionContext,
    action
) {
    if (!metadata.authorization) {
        return;
    }
    const currentUserId = executionContext.identity.id;
    if (enforcer) {
        let aclAllowed = await enforcer.enforce(currentUserId, metadata.namePlural, action);
        if (aclAllowed) {
            return;
        }
    }
    if (!metadata.authorization.ownership) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
    let actionAllowed =
        metadata.authorization.ownership.allowedActions.indexOf(action) >= 0 ||
        metadata.authorization.ownership.allowedActions.indexOf(`*`) >= 0;
    if (!actionAllowed) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
    filter[`owner.id`] = currentUserId;
}

module.exports = { checkAuthorizationOrAddOwnerToFilter };
