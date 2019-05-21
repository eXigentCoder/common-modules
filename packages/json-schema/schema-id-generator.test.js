'use strict';

const { createGenerator, generateId } = require('./schema-id-generator');
const validBaseUrl = 'https://asd.com';
describe('JSON Schemas', () => {
    describe('Schema id validator', () => {
        describe('createGenerator', () => {
            it('should throw an error if no baseurl is provided', () => {
                expect(() => createGenerator()).to.throw();
            });
            it('should throw an error if no collection name is provided', () => {
                expect(() => createGenerator(validBaseUrl)()).to.throw();
            });
        });
        describe('generateId', () => {
            it('should throw an error if no baseurl is provided', () => {
                expect(() => generateId()).to.throw();
            });
            it('should throw an error if no collection name is provided', () => {
                expect(() => generateId(validBaseUrl)).to.throw();
            });
            it('should correctly combine the base url and component', () => {
                const result = generateId(validBaseUrl, 'qqq');
                expect(result).to.equal(`${validBaseUrl}/qqq`);
            });
            it('should not add an extra / if the component name has one already', () => {
                const result = generateId(validBaseUrl, '/qqq');
                expect(result).to.equal(`${validBaseUrl}/qqq`);
            });
        });
    });
});
