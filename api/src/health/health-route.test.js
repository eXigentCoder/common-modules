'use strict';

const superTest = require(`supertest`);
const app = require(`../express/app`);

describe(`Health route`, () => {
    it(`should return 200 OK if the server is running`, done => {
        const request = superTest(app);
        request
            .get(`/`)
            .expect(200)
            .expect(`Content-Type`, /json/)
            .end(done);
    });
});
