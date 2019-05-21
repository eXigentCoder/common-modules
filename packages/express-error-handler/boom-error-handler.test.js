'use strict';

const boomErrorHandler = require('./boom-error-handler');
const httpMocks = require('node-mocks-http');
const boom = require('@hapi/boom');
const events = require('events');

describe('Express error handler', () => {
    describe('boomErrorHandler', () => {
        describe('production boomErrorHandler', () => {
            const prodHandler = boomErrorHandler({ exposeServerErrorMessages: false });
            it('Should expose client errors back to the client', done => {
                const errors = { '1': 'some error', '2': 'some other error' };
                const error = boom.badRequest('Naughty!', errors);
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/user/42',
                    params: {
                        id: 42,
                    },
                });
                const res = httpMocks.createResponse({
                    eventEmitter: events.EventEmitter,
                });

                res.on('end', function() {
                    const data = JSON.parse(res._getData());
                    expect(data.message).to.equal('Naughty!');
                    expect(data.error).to.equal('Bad Request');
                    expect(data.statusCode).to.equal(400);
                    expect(data.data).to.eql(errors);
                    done();
                });

                prodHandler(error, req, res);
            });
            it('Should hide server errors from client', done => {
                const error = boom.internal('Naughty!');
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/user/42',
                    params: {
                        id: 42,
                    },
                });
                const res = httpMocks.createResponse({
                    eventEmitter: events.EventEmitter,
                });

                res.on('end', function() {
                    const data = JSON.parse(res._getData());
                    expect(data.message).to.equal('An internal server error occurred');
                    expect(data.error).to.equal('Internal Server Error');
                    expect(data.statusCode).to.equal(500);
                    done();
                });

                prodHandler(error, req, res);
            });
        });
        describe('dev boomErrorHandler', () => {
            const devHandler = boomErrorHandler({ exposeServerErrorMessages: true });
            it('Should expose badRequests back to the client', done => {
                const error = boom.badRequest('Naughty!');
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/user/42',
                    params: {
                        id: 42,
                    },
                });
                const res = httpMocks.createResponse({
                    eventEmitter: events.EventEmitter,
                });

                res.on('end', function() {
                    const data = JSON.parse(res._getData());
                    expect(data.message).to.equal('Naughty!');
                    expect(data.error).to.equal('Bad Request');
                    expect(data.statusCode).to.equal(400);
                    done();
                });

                devHandler(error, req, res);
            });
            it('Should expose server errors to client', done => {
                const error = boom.internal('Naughty!');
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/user/42',
                    params: {
                        id: 42,
                    },
                });
                const res = httpMocks.createResponse({
                    eventEmitter: events.EventEmitter,
                });

                res.on('end', function() {
                    const data = JSON.parse(res._getData());
                    expect(data.message).to.equal('An internal server error occurred');
                    expect(data.error).to.equal('Internal Server Error');
                    expect(data.statusCode).to.equal(500);
                    expect(data.errMessage).to.equal('Naughty!');
                    done();
                });

                devHandler(error, req, res);
            });
            it('Should expose server errors data to client', done => {
                const error = boom.internal('Naughty!');
                error.data = {
                    hi: true,
                };
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/user/42',
                    params: {
                        id: 42,
                    },
                });
                const res = httpMocks.createResponse({
                    eventEmitter: events.EventEmitter,
                });

                res.on('end', function() {
                    const data = JSON.parse(res._getData());
                    expect(data.message).to.equal('An internal server error occurred');
                    expect(data.error).to.equal('Internal Server Error');
                    expect(data.statusCode).to.equal(500);
                    expect(data.errMessage).to.equal('Naughty!');
                    expect(data.data).to.eql(error.data);
                    done();
                });

                devHandler(error, req, res);
            });
        });
    });
});
