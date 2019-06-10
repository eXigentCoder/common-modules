'use strict';

const { getSchemaPathFromEntityPath } = require(`./json-schema-utilities`);

describe(`Entity Metadata`, () => {
    describe(`JSON Schema Utilities`, () => {
        describe(`getSchemaPathFromEntityPath`, () => {
            it(`Should return "" if falsy`, () => {
                // @ts-ignore
                const path = getSchemaPathFromEntityPath();
                expect(path).to.equal(``);
            });
            it(`Should return "properties.item" if only one`, () => {
                // @ts-ignore
                const path = getSchemaPathFromEntityPath(`item`);
                expect(path).to.equal(`properties.item`);
            });
            it(`Should return "properties.item.properties.subItem" if two levels`, () => {
                // @ts-ignore
                const path = getSchemaPathFromEntityPath(`item.subItem`);
                expect(path).to.equal(`properties.item.properties.subItem`);
            });
        });
    });
});
