'use strict';

const moment = require(`moment`);
const { IsRequiredError } = require(`../common-errors`);
const get = require(`lodash/get`);
/**
 * @param {import("../entity-metadata/types").EntityMetadata} metadata
 * @returns {import("./types").SetOwnerIfApplicable}
 */
function createSetOwnerIfApplicable(metadata) {
    /** @type {import("./types").SetOwnerIfApplicable} */
    return function setOwnerIfApplicable(entity, context) {
        if (!metadata.authorization || !metadata.authorization.ownership) {
            return;
        }
        let ownership = metadata.authorization.ownership;
        const setOwnerMap = {
            creator: setOwnerFromCreator,
            setFromEntity: setOwnerFromEntity,
            setFromContext: setOwnerFromContext,
        };
        const fn = setOwnerMap[ownership.initialOwner];
        fn ? fn() : invalidOwner();
        if (!entity.owner.id) {
            throw new IsRequiredError(`entity.owner.id`, `setOwnerIfApplicable`, null, {
                decorate: { ownership, context },
            });
        }

        function invalidOwner() {
            throw new Error(`Invalid initialOwner value: ${ownership.initialOwner}`);
        }

        function setOwnerFromCreator() {
            entity.owner = {
                id: context.identity.id,
            };
            addOwnershipLog();
        }

        function setOwnerFromEntity() {
            entity.owner = {
                id: get(entity, ownership.pathToId),
            };
            addOwnershipLog();
        }

        function setOwnerFromContext() {
            entity.owner = {
                id: get(context, ownership.pathToId),
            };
            addOwnershipLog();
        }

        function addOwnershipLog() {
            entity.owner.date = moment.utc().toISOString();
            entity.owner.log = [
                {
                    owner: entity.owner.id,
                    date: entity.owner.date,
                    reason: `creation`,
                },
            ];
        }
    };
}

module.exports = createSetOwnerIfApplicable;
