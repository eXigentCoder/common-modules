'use strict';

const runRequestForVerb = require(`./run-request-for-verb`);
const cryptop = require(`crypto`);

describe(`Azure-Functions`, () => {
    describe(`runRequestForVerb`, () => {
        /**@type {import('azure-functions-ts-essentials').HttpRequest} */
        const fakeGetReq = {
            // @ts-ignore
            method: `GET`,
        };
        /** @returns {import('./types').RequestHandler} */
        function echo(val) {
            return async function() {
                return new Promise(resolve => {
                    process.nextTick(() => resolve(val));
                });
            };
        }
        it(`should call the corresponding function if a match is found`, async () => {
            const verbReqMap = {
                GET: echo(`get`),
                POST: echo(`post`),
                PUT: echo(`put`),
                DELETE: echo(`delete`),
            };
            const result = await runRequestForVerb(testContext(), fakeGetReq, verbReqMap);
            expect(result).to.eql(`get`);
        });
        it(`should work even if the verb was lowercase`, async () => {
            const verbReqMap = {
                get: echo(`get`),
            };
            // @ts-ignore
            const result = await runRequestForVerb(testContext(), fakeGetReq, verbReqMap);
            expect(result).to.equal(`get`);
        });
        it(`should throw an error if the method is not found`, async () => {
            const verbReqMap = {};
            await expect(runRequestForVerb(testContext(), fakeGetReq, verbReqMap)).to.be.rejected;
        });
        it(`should throw an error if the method is a promise`, async () => {
            const verbReqMap = {
                GET: makeReq(),
            };
            async function makeReq() {
                return function() {
                    return {};
                };
            }
            // @ts-ignore
            await expect(runRequestForVerb(testContext(), fakeGetReq, verbReqMap)).to.be.rejected;
        });
        it(`Should pass in the correct parameters`, done => {
            /**@type {import('azure-functions-ts-essentials').HttpRequest} */
            const fakReq = {
                // @ts-ignore
                method: `GET`,
            };
            const verbReqMap = {
                GET: async ({ req, context }) => {
                    expect(req).to.be.ok;
                    expect(context).to.be.ok;
                    done();
                },
            };
            runRequestForVerb(testContext(), fakReq, verbReqMap);
        });
    });
});
function testContext() {
    return {
        requestId: cryptop.randomBytes(20).toString(`hex`),
        codeVersion: `1.0.0`,
        sourceIp: `127.0.0.1`,
        identity: {
            id: cryptop.randomBytes(20).toString(`hex`),
            title: `Bob`,
        },
    };
}
