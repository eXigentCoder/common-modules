'use strict';
var chai = require('chai');
var expect = chai.expect;
const notFound = require('./not-found');

describe('notFound', () => {
    const handle = notFound();
    it('should send a 404 request with `Route not found : req.originalUrl`', () => {
        const req = {
            originalUrl: 'someUrl',
        };
        const res = {};
        res.status = code => {
            res._code = code;
            return res;
        };
        res.json = data => {
            res._data = data;
        };
        handle(req, res);
        expect(res._code).to.equal(404);
        expect(res._data.message).to.equal(`Route not found : ${req.originalUrl}`);
    });
});
