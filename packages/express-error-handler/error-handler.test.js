'use strict';

const errorHandler = require('./error-handler');
const boom = require('@hapi/boom');
const { ValidationError } = require('../common-errors');

describe('Express error handler', () => {
    describe('ErrorHandler', () => {
        const handle = errorHandler();
        it('should pass through boom errors', () => {
            const error = boom.badRequest('hi');
            expect(boom.isBoom(error)).to.equal(true);
            handle(error, null, null, next);
            function next(err) {
                expect(boom.isBoom(err)).to.equal(true);
                expect(err).to.equal(error);
            }
        });
        it('should wrap non boom errors', () => {
            const error = new Error('test');
            expect(boom.isBoom(error)).to.equal(false);
            handle(error, null, null, next);
            function next(err) {
                expect(boom.isBoom(err)).to.equal(true);
            }
        });
        it('should wrap strings as internal boom errors', () => {
            const error = 'hi';
            expect(boom.isBoom(error)).to.equal(false);
            handle(error, null, null, next);
            function next(err) {
                expect(boom.isBoom(err)).to.equal(true);
                expect(err.isServer).to.equal(true);
                expect(err.output.statusCode).to.equal(500);
            }
        });
        it('should wrap objects as internal boom errors', () => {
            const error = { message: 'hi' };
            expect(boom.isBoom(error)).to.equal(false);
            handle(error, null, null, next);
            function next(err) {
                expect(boom.isBoom(err)).to.equal(true);
                expect(err.isServer).to.equal(true);
                expect(err.output.statusCode).to.equal(500);
                expect(err.data).to.equal(error);
            }
        });
        it('should use the provided toBoom method on an error if exists', () => {
            const errors = { '1': 'some error', '2': 'some other error' };
            const error = new ValidationError('validation failed', errors);
            expect(boom.isBoom(error)).to.equal(false);
            handle(error, null, null, next);
            function next(err) {
                expect(boom.isBoom(err)).to.equal(true);
                expect(err.isServer).to.equal(false);
            }
        });
    });
});
