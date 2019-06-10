'use strict';
const ObjectId = require(`mongodb`).ObjectId;
const createVersionInfoSetter = require(`./create-version-info-setter`);
const { jsonSchemas } = require(`../validation-mongodb`);
/**@type {import('../entity-metadata').EntityMetadata} */
const metadata = {
    name: `bob`,
    collectionName: `bobs`,
    identifier: {
        pathToId: `_id`,
        schema: jsonSchemas.objectId,
    },
    schemas: {
        core: {
            name: `asd`,
            $id: ``,
            properties: {},
            type: `object`,
        },
    },
};
const setVersionInfo = createVersionInfoSetter({ metadata });
describe(`Version Info`, () => {
    describe(`setVersionInfo`, () => {
        /**@type {import('./types').ExecutionContext} */
        const validContext = {
            requestId: `1`,
            identity: {
                id: `1`,
            },
            codeVersion: `0.0.1`,
            sourceIp: `127.0.0.1`,
            source: `tests`,
        };
        describe(`object`, () => {
            it(`should throw an error if no object provided`, () => {
                // @ts-ignore
                expect(() => setVersionInfo()).to.throw();
            });
            it(`should throw an error if object is not an object`, () => {
                // @ts-ignore
                expect(() => setVersionInfo(1)).to.throw();
            });
            it(`should throw an error if object has _id but no versionInfo`, () => {
                const object = {
                    _id: new ObjectId().toString(),
                    name: `bob`,
                };

                // @ts-ignore
                expect(() => setVersionInfo(object, validContext)).to.throw();
            });
        });
        describe(`context`, () => {
            it(`should throw an error if no context provided`, () => {
                // @ts-ignore
                expect(() => setVersionInfo({})).to.throw();
            });
            it(`should throw an error if context is not an object`, () => {
                // @ts-ignore
                expect(() => setVersionInfo({}, 1)).to.throw();
            });
            describe(`requestId`, () => {
                it(`should throw an error if no requestId provided`, () => {
                    // @ts-ignore
                    expect(() => setVersionInfo({}, {})).to.throw();
                });
                it(`should throw an error if requestId is not a string`, () => {
                    // @ts-ignore
                    expect(() => setVersionInfo({}, { requestId: 1 })).to.throw();
                });
                it(`should throw an error if requestId is a blank string`, () => {
                    // @ts-ignore
                    expect(() => setVersionInfo({}, { requestId: ` ` })).to.throw();
                });
            });
            describe(`identity`, () => {
                it(`should throw an error if no identity provided`, () => {
                    // @ts-ignore
                    expect(() => setVersionInfo({}, { requestId: `asd` })).to.throw();
                });
                it(`should throw an error if identity is not an object`, () => {
                    // @ts-ignore
                    expect(() => setVersionInfo({}, { requestId: `asd`, identity: 1 })).to.throw();
                });
                it(`should throw an error if identity is not an object with at least the id property`, () => {
                    expect(() =>
                        // @ts-ignore
                        setVersionInfo({}, { requestId: `asd`, identity: { bob: true } })
                    ).to.throw();
                });
            });
            describe(`codeVersion`, () => {
                it(`should throw an error if no codeVersion provided`, () => {
                    expect(() =>
                        // @ts-ignore
                        setVersionInfo({}, { requestId: `asd`, identity: { id: `1` } })
                    ).to.throw();
                });
                it(`should throw an error if codeVersion is not a string`, () => {
                    // @ts-ignore
                    expect(() =>
                        // @ts-ignore
                        setVersionInfo(
                            {},
                            { requestId: `asd`, identity: { id: `1` }, codeVersion: {} }
                        )
                    ).to.throw();
                });
                it(`should throw an error if codeVersion is a blank string`, () => {
                    expect(() =>
                        setVersionInfo(
                            {},
                            { requestId: `asd`, identity: { id: `1` }, codeVersion: ` ` }
                        )
                    ).to.throw();
                });
            });
        });

        it(`should be able to add version info to a new object`, () => {
            setVersionInfo({}, validContext);
        });

        it(`should be able to add version info to an existing object with versionInfo`, () => {
            const existingObject = {};
            setVersionInfo(existingObject, validContext);
            existingObject.versionInfo.dateCreated = new Date(
                existingObject.versionInfo.dateCreated
            );
            setVersionInfo(existingObject, validContext);
        });
    });
});
