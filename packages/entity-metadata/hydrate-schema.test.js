'use strict';

const { addTenantInfo, addVersionInfo, addStatusInfo } = require(`./hydrate-schema`);

describe(`Entity Metadata`, () => {
    describe(`Hydrate Schema`, () => {
        describe(`Add Version Info`, () => {
            it(`should add the version info to the object`, () => {
                const schema = {
                    properties: {},
                    required: [],
                };
                addVersionInfo(schema);
                expect(schema.properties.versionInfo).to.be.ok;
            });
        });
        describe(`Add statuses`, () => {
            it(`should not do anything if metadata.statuses is falsy`, () => {
                const schema = {};
                const copy = JSON.parse(JSON.stringify(schema));
                const statuses = undefined;
                addStatusInfo(schema, { statuses });
                expect(schema).to.eql(copy);
            });
            it(`should not do anything if metadata.statuses is an empty array`, () => {
                const schema = {};
                const copy = JSON.parse(JSON.stringify(schema));
                const statuses = [];
                addStatusInfo(schema, { statuses });
                expect(schema).to.eql(copy);
            });
            it(`should add the status to the schema if metadata.statuses has a valid definition and is required`, () => {
                const schema = {};
                const copy = JSON.parse(JSON.stringify(schema));
                /**@type {import('./types').StatusFieldDefinition} */
                const definiton = {
                    pathToStatusField: `kanbanStatus`,
                    isRequired: true,
                    allowedValues: [{ name: `to do` }, { name: `in progress` }, { name: `done` }],
                };
                const statuses = [definiton];
                addStatusInfo(schema, { statuses });
                expect(schema).to.not.eql(copy);
                expect(schema.properties.kanbanStatus).to.be.ok;
                expect(schema.properties.kanbanStatusDate).to.be.ok;
                expect(schema.properties.kanbanStatusLog).to.be.ok;
            });
            it(`should add the status to the schema if metadata.statuses has a valid definition and is not required`, () => {
                const schema = {};
                const copy = JSON.parse(JSON.stringify(schema));
                /**@type {import('./types').StatusFieldDefinition} */
                const definiton = {
                    pathToStatusField: `kanbanStatus`,
                    isRequired: false,
                    allowedValues: [{ name: `to do` }, { name: `in progress` }, { name: `done` }],
                };
                const statuses = [definiton];
                addStatusInfo(schema, { statuses });
                expect(schema).to.not.eql(copy);
                expect(schema.properties.kanbanStatus).to.be.ok;
                expect(schema.properties.kanbanStatusDate).to.be.ok;
                expect(schema.properties.kanbanStatusLog).to.be.ok;
            });
        });
        describe(`Add Tenant Info`, () => {
            it(`should not do anything if teantInfo is falsy`, () => {
                const schema = {};
                const copy = JSON.parse(JSON.stringify(schema));
                const tenantInfo = undefined;
                addTenantInfo(schema, tenantInfo);
                expect(schema).to.eql(copy);
            });
            it(`should add tenant info to a schema`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {};
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.properties.teamId).to.eql(tenantInfo.schema);
                expect(schema.required.indexOf(`teamId`)).to.be.greaterThan(-1);
            });
            it(`should not add a duplicate required field`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {
                    required: [`teamId`],
                };
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.required.length).to.equal(1);
            });
            it(`should add the required value even if the schema was already set`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {
                    properties: {
                        teamId: {
                            type: `integer`,
                        },
                    },
                };
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.required.indexOf(`teamId`)).to.be.greaterThan(-1);
            });
            it(`should add tenant info to a schema even if nested`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {};
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `team.teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.properties.team.properties.teamId).to.eql(tenantInfo.schema);
                expect(schema.properties.team.required.indexOf(`teamId`)).to.be.greaterThan(-1);
            });
            it(`should mark all sub paths as required when nested`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {};
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `team.teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.required.indexOf(`team`)).to.be.greaterThan(-1);
                expect(schema.properties.team.required.indexOf(`teamId`)).to.be.greaterThan(-1);
            });
            it(`should not replace the required fields if some where set`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {
                    type: `object`,
                    properties: {
                        team: {
                            type: `object`,
                            properties: {
                                name: {
                                    type: `string`,
                                },
                            },
                            required: [`name`],
                        },
                    },
                };
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `team.teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.properties.team.properties.teamId).to.eql(tenantInfo.schema);
                expect(schema.properties.team.properties.name).to.eql({
                    type: `string`,
                });
                expect(schema.properties.team.required.indexOf(`teamId`)).to.be.greaterThan(-1);
                expect(schema.properties.team.required.indexOf(`name`)).to.be.greaterThan(-1);
            });
            it(`should work when the id is nested more than 2 levels deep`, () => {
                /** @type {import('./types').JsonSchema} */
                const schema = {
                    type: `object`,
                    properties: {
                        someObject: {
                            properties: {
                                someOtherObject: {
                                    properties: {
                                        someOtherOtherObject: {
                                            type: `object`,
                                            properties: {
                                                name: {
                                                    type: `string`,
                                                },
                                            },
                                            required: [`name`],
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
                /** @type {import('./types').TenantInfo} */
                const tenantInfo = {
                    entityPathToId: `someObject.someOtherObject.someOtherOtherObject.teamId`,
                    schema: {
                        type: `integer`,
                    },
                    executionContextSourcePath: `identity.id`,
                    title: `Team`,
                };
                addTenantInfo(schema, tenantInfo);
                expect(schema.required.indexOf(`someObject`)).to.be.greaterThan(-1);
                expect(
                    schema.properties.someObject.required.indexOf(`someOtherObject`)
                ).to.be.greaterThan(-1);
                expect(
                    schema.properties.someObject.properties.someOtherObject.required.indexOf(
                        `someOtherOtherObject`
                    )
                ).to.be.greaterThan(-1);
                expect(
                    schema.properties.someObject.properties.someOtherObject.properties.someOtherOtherObject.required.indexOf(
                        `name`
                    )
                ).to.be.greaterThan(-1);
                expect(
                    schema.properties.someObject.properties.someOtherObject.properties.someOtherOtherObject.required.indexOf(
                        `teamId`
                    )
                ).to.be.greaterThan(-1);
            });
        });
    });
});
