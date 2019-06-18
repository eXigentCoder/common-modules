'use strict';
const { compile } = require(`json-schema-to-typescript`);
const getSchema = require(`./metadata-schema`);
const fs = require(`fs-extra`);
describe(`Entity Metadata`, () => {
    describe(`Schema to typescript`, () => {
        it(`should generate the typescript definition automatically`, async () => {
            const schema = getSchema();
            const schemaName = `EntityMetadata`;
            const prettierString = await fs.readFile(`./.prettierrc`, { encoding: `utf8` });
            const prettierJson = JSON.parse(prettierString);
            let ts = await compile(schema, schemaName, {
                style: prettierJson,
            });
            expect(ts).to.be.ok;
            const codeStartIndex = ts.indexOf(`\nexport interface ${schemaName}`);
            ts = insertAt(ts, codeStartIndex, `\nimport { JsonSchema } from './types';\n`);
            const [startIndex, endIndex] = findStartEndIndexes(
                ts,
                `export interface JsonSchema {\n`,
                `}\n`
            );
            ts = ts.substring(0, startIndex) + ts.substr(endIndex, startIndex);
            fs.writeFile(`./packages/entity-metadata/entity-metadata.d.ts`, ts, {
                encoding: `utf8`,
            });
        });
    });
});

/**
 * @param {string} inputString
 * @param {number} index
 * @param {string} stringToAdd
 */
function insertAt(inputString, index, stringToAdd) {
    return inputString.substr(0, index) + stringToAdd + inputString.substr(index);
}

/**
 * @param {string} inputString
 * @param {string} startString
 * @param {string} endString
 */
function findStartEndIndexes(inputString, startString, endString) {
    const startIndex = inputString.indexOf(startString);
    let endIndex = inputString.indexOf(endString, startIndex);
    endIndex += endString.length;
    return [startIndex, endIndex];
}
