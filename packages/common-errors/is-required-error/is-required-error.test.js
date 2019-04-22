'use strict';
const IsRequiredError = require('./is-required-error');
var chai = require('chai');
var expect = chai.expect;

describe('IsRequiredError', () => {
    it('should be an instance of the Error class', () => {
        const error = new IsRequiredError('test');
        expect(error).to.be.instanceOf(Error);
    });
    it('should have the correct name', function() {
        const error = new IsRequiredError('test');
        expect(error.name).to.equal(IsRequiredError.name);
    });
    it('should have an error code for localisation', function() {
        const error = new IsRequiredError('test');
        expect(error.code).to.be.ok;
    });
    it('should have a stack', function() {
        const error = new IsRequiredError('test');
        expect(error.stack).to.be.ok;
    });
    it('should have a message', function() {
        const error = new IsRequiredError('test');
        expect(error.message).to.be.ok;
    });
    it('should allow you to specify the function name', function() {
        const error = new IsRequiredError('test', 'mochaTests');
        expect(error.message).to.be.ok;
    });
});
