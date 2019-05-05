'use strict';
var chai = require('chai');
var expect = chai.expect;
const initialise = require('.');
const { IsRequiredError } = require('../common-errors');
const express = require('express');

describe('expressErrorHandler', () => {
    describe('initialise', function() {
        it('should throw an error if no options provided', () => {
            expect(() => initialise()).to.throw(TypeError);
        });
        it('should throw an error if name was not provided', () => {
            expect(() => initialise({})).to.throw(IsRequiredError);
            expect(() => initialise({})).to.throw(/options\.name/);
        });
        it('should throw an error if app was not provided', () => {
            expect(() => initialise({ name: 'asd' })).to.throw(IsRequiredError);
            expect(() => initialise({ name: 'asd' })).to.throw(/options\.app/);
        });
        it('should should succeed for the happy case', () => {
            const app = express();
            initialise({
                name: 'test',
                app,
            });
        });
    });
});
