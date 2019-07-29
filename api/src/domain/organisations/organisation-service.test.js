'use strict';
const {
    create,
    getMetadata,
    getById,
    deleteById,
    replaceById,
    search,
} = require('./organisation-service');
const {
    createQueryStringMapper,
} = require('@bit/exigentcoder.common-modules.mongodb');
const get = require('lodash/get');

describe('Organisations Service', () => {
    const metadata = getMetadata();
    const queryStringMapper = createQueryStringMapper(metadata.schemas.core);
    const validOrganisationForCreation = function() {
        return {
            title: 'Bobs awesome organisation',
        };
    };
    const validContext = {
        requestId: '1',
        identity: {
            id: '1',
        },
        codeVersion: '0.0.1',
        sourceIp: '127.0.0.1',
    };
    describe('Create', () => {
        it('should fail if not passed any args', async () => {
            // @ts-ignore
            await expect(create()).to.be.rejected;
        });

        it('should fail if passed a valid organisation but no context', async () => {
            // @ts-ignore
            await expect(create(validOrganisationForCreation())).to.be.rejected;
        });

        it("should succeed if passed a valid organisation that doesn't exist and valid context", async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            expect(created).to.be.ok;
        });

        it('should return an object with the version info set on it', async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            expect(created.versionInfo).to.be.ok;
        });

        it('should not modify the object passed in', async () => {
            const obj = validOrganisationForCreation();
            const oldCopy = JSON.parse(JSON.stringify(obj));
            expect(oldCopy).to.eql(obj);
            const created = await create(obj, validContext);
            expect(created).to.be.ok;
            expect(oldCopy).to.eql(obj);
            expect(oldCopy).to.not.eql(created);
        });

        it('should generate the identifier based on the title of the object', async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            expect(created.identifier).to.be.ok;
            expect(created.identifier).to.equal('bobs-awesome-organisation');
        });

        it('should return an object with the identifier set', async () => {
            const metadata = getMetadata();
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            expect(created).to.be.ok;
            expect(get(created, metadata.identifier.pathToId)).to.be.ok;
        });
    });
    describe('Get by id', () => {
        it('should throw an error if no id is provided', async () => {
            // @ts-ignore
            await expect(getById()).to.be.rejected;
        });

        it('should return the item if the id is valid', async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            const retrieved = await getById(created._id);
            expect(retrieved).eql(created);
        });
    });
    describe('Delete by id', () => {
        // it('should throw an error if deleting a document that does not exist', async () => {
        //     await expect(deleteById(new Date().toISOString())).to.be.rejected;
        // });
        it('should not throw an error if deleting a document that exists', async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            await deleteById(created._id);
        });
    });

    describe('Replace by id', () => {
        it('should return the item if the id is valid', async () => {
            const created = await create(
                validOrganisationForCreation(),
                validContext
            );
            const toUpdate = JSON.parse(JSON.stringify(created));
            toUpdate.title += 'updated';
            const updated = await replaceById(
                created._id,
                created,
                validContext
            );
            expect(updated.identifier).eql(created.identifier);
        });
    });
    describe('search', () => {
        const query = queryStringMapper('');
        it('should return an array', async () => {
            const result = await search(query);
            expect(result.items).to.be.an('array');
        });
        it('should allow query Params', async () => {
            const org = validOrganisationForCreation();
            org.title = 'TestForQuery';
            await create(org, validContext);
            const result = await search(query);
            expect(result.items).to.be.an('array');
        });
    });
});
