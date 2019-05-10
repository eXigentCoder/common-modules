'use strict';

const initialise = require('.');
const { IsRequiredError } = require('../common-errors');
const express = require('express');

describe('expressErrorHandler', () => {
    describe('initialise', function() {
        it('should throw an error if no app provided', () => {
            expect(() => initialise()).to.throw(IsRequiredError);
        });
        it('should throw an error if app was not provided', () => {
            expect(() => initialise(null, { name: 'asd' })).to.throw(IsRequiredError);
        });
        it('should should succeed for the happy case', () => {
            const app = express();
            initialise(app);
        });
    });
});
