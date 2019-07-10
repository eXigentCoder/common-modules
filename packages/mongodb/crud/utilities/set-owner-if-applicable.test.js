'use strict';

const { createSetOwnerIfApplicable } = require(`./set-owner-if-applicable`);
const { stringIdNoTenantOwnership, validEntity, createContext } = require(`../../test-utilities`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Utilities`, () => {
            describe(`setOwnerIfApplicable`, () => {
                it(`should set the owner to the creator if metadata.authorization.ownership.initialOwner === 'creator'`, () => {
                    const metadata = stringIdNoTenantOwnership({ initialOwner: `creator` });
                    const setOwnerIfApplicable = createSetOwnerIfApplicable(metadata);
                    const entity = validEntity();
                    const context = createContext();
                    setOwnerIfApplicable(entity, context);
                    expect(entity.owner.id).to.equal(context.identity.id);
                });
                it(`should set the owner to the creator if metadata.authorization.ownership.initialOwner === 'setFromEntity'`, () => {
                    const metadata = stringIdNoTenantOwnership({
                        initialOwner: `setFromEntity`,
                        pathToId: `username`,
                    });
                    const setOwnerIfApplicable = createSetOwnerIfApplicable(metadata);
                    const entity = validEntity();
                    const context = createContext();
                    setOwnerIfApplicable(entity, context);
                    expect(entity.owner.id).to.equal(entity.username);
                });
                it(`should set the owner to the creator if metadata.authorization.ownership.initialOwner === 'setFromContext'`, () => {
                    const metadata = stringIdNoTenantOwnership({
                        initialOwner: `setFromContext`,
                        pathToId: `requestId`,
                    });
                    const setOwnerIfApplicable = createSetOwnerIfApplicable(metadata);
                    const entity = validEntity();
                    const context = createContext();
                    setOwnerIfApplicable(entity, context);
                    expect(entity.owner.id).to.equal(context.requestId);
                });
                it(`should throw an error if metadata.authorization.ownership.initialOwner is invalid`, () => {
                    const metadata = stringIdNoTenantOwnership({
                        initialOwner: `bob`,
                        pathToId: `requestId`,
                    });
                    const setOwnerIfApplicable = createSetOwnerIfApplicable(metadata);
                    const entity = validEntity();
                    const context = createContext();
                    expect(() => setOwnerIfApplicable(entity, context)).to.throw(
                        `Invalid initialOwner value`
                    );
                });
            });
        });
    });
});
