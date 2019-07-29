'use strict';

const superTest = require('supertest');
const app = require('../express/app');
// @ts-ignore
const uncaughtErrorMessage = require('./error-test-router')
    ._uncaughtErrorMessage;

describe('Test errors', function() {
    const request = superTest(app);
    it('server', function(done) {
        request
            .get('/error/server')
            .expect(500)
            .end(done);
    });
    it('client', function(done) {
        request
            .get('/error/client')
            .expect(400)
            .end(done);
    });
    it.skip('process', function(done) {
        const listners = process.listeners('uncaughtException');
        process.removeAllListeners(['uncaughtException']);
        process.once('uncaughtException', function(error) {
            listners.forEach(function(listner) {
                process.listeners('uncaughtException').push(listner);
            });
            expect(error).to.be.ok;
            expect(error.message).to.equal(uncaughtErrorMessage);
            return done();
        });
        request
            .get('/error/process')
            .expect(500)
            .end(done);
    });
});
