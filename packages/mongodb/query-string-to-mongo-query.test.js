'use strict';
var qs = require(`qs`);
const createQueryStringMapper = require(`./query-string-to-mongo-query`);

describe(`MongoDB`, () => {
    describe(`Query String Mapper`, () => {
        const schema = {
            name: `users`,
            properties: {
                name: {
                    type: `string`,
                },
                number: {
                    type: `number`,
                },
                integer: {
                    type: `integer`,
                },
                boolean: {
                    type: `boolean`,
                },
                object: {
                    type: `object`,
                    properties: {
                        name: {
                            type: `string`,
                        },
                        number: {
                            type: `number`,
                        },
                        integer: {
                            type: `integer`,
                        },
                        boolean: {
                            type: `boolean`,
                        },
                    },
                },
            },
        };

        it(`Should generate a query for an empty queryString string`, () => {
            const mapper = createQueryStringMapper(schema);
            const queryString = ``;
            const result = mapper(queryString);
            expect(result).to.be.ok;
        });

        it(`Should generate a query for an empty queryString object`, () => {
            const mapper = createQueryStringMapper(schema);
            const queryString = ``;
            const result = mapper(queryString);
            expect(result).to.be.ok;
        });

        it(`Should generate be able to generate a filter from a queryString string`, () => {
            const mapper = createQueryStringMapper(schema);
            const queryString = `name=bob`;
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter.name).to.equal(`bob`);
        });

        it(`Should generate be able to generate a filter from a queryString object`, () => {
            const mapper = createQueryStringMapper(schema);
            const queryString = { name: `bob` };
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter.name).to.equal(`bob`);
        });

        it(`Should generate be able to generate properties from a queryString string`, () => {
            const mapper = createQueryStringMapper(schema);
            let queryString = `skip=1&limit=3&sort=-name&fields=name&filter={"$or":[{"name":"bob"},{"name":"bobson"}]}`;
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter.$or).to.be.an(`array`);
            expect(result.filter.$or).to.have.lengthOf(2);
            expect(result.filter.$or[0].name).to.equal(`bob`);
            expect(result.filter.$or[1].name).to.equal(`bobson`);
            expect(result.limit).to.equal(3);
            expect(result.skip).to.equal(1);
            expect(result.sort.name).to.equal(-1);
            expect(result.projection).to.eql({ name: 1 });
        });

        it(`Should be able to parse a stringified object`, () => {
            const mapper = createQueryStringMapper(schema);
            const qsObj = {
                filter: {
                    $or: [{ name: `bob` }, { name: `bobson` }],
                },
                skip: 1,
                limit: 3,
                sort: `-name`,
                fields: `_id,name`,
            };
            let qsOverWire = qs.stringify(qsObj);
            let qsDecoded = qs.parse(qsOverWire);
            const result = mapper(qsDecoded);
            expect(result).to.be.ok;
            expect(result.filter.$or).to.be.an(`array`);
            expect(result.filter.$or).to.have.lengthOf(2);
            expect(result.filter.$or[0].name).to.equal(`bob`);
            expect(result.filter.$or[1].name).to.equal(`bobson`);
            expect(result.limit).to.equal(3);
            expect(result.skip).to.equal(1);
            expect(result.sort.name).to.equal(-1);
            expect(result.projection).to.eql({ _id: 1, name: 1 });
        });

        it(`Should allow you to set the default options`, () => {
            /**@type {import('./types').QueryStringMapperOptions} */
            const options = {
                skip: 3,
                limit: 0,
                projection: { name: 1, _id: 1 },
                sort: { name: -1 },
            };
            const mapper = createQueryStringMapper(schema, options);
            const result = mapper(``);
            expect(result).to.be.ok;
            expect(result.limit).to.equal(0);
            expect(result.skip).to.equal(3);
            expect(result.sort).to.eql({ name: -1 });
            expect(result.projection).to.eql({ name: 1, _id: 1 });
        });
        it(`Should be able to cast parameters based on the schema`, () => {
            const mapper = createQueryStringMapper(schema);
            const obj = {
                number: 1.03,
                integer: 2,
                boolean: true,
                myObject: {
                    number: 1.03,
                    integer: 2,
                    boolean: true,
                    subSub: {
                        number: 1.03,
                        integer: 2,
                        boolean: true,
                    },
                },
            };
            let qsOverWire = qs.stringify(obj);
            let qsDecoded = qs.parse(qsOverWire);
            const result = mapper(qsDecoded);
            expect(result).to.be.ok;
            expect(result.filter.number).to.be.a(`number`);
            expect(result.filter.integer).to.be.a(`number`);
            expect(result.filter.boolean).to.be.a(`boolean`);
            expect(result.filter[`myObject.number`]).to.be.a(`number`);
            expect(result.filter[`myObject.integer`]).to.be.a(`number`);
            expect(result.filter[`myObject.boolean`]).to.be.a(`boolean`);
            expect(result.filter[`myObject.subSub.number`]).to.be.a(`number`);
            expect(result.filter[`myObject.subSub.integer`]).to.be.a(`number`);
            expect(result.filter[`myObject.subSub.boolean`]).to.be.a(`boolean`);
        });
        it(`Should work with a nested $in`, () => {
            const mapper = createQueryStringMapper(schema);
            const qsObj = {
                filter: {
                    quantity: { $in: [20, 50] },
                },
            };
            const result = mapper(qsObj);
            expect(result).to.be.ok;
            expect(result.filter.quantity.$in).to.be.an(`array`);
            expect(result.filter.quantity.$in).to.have.lengthOf(2);
            expect(result.filter.quantity.$in[0]).to.equal(20);
            expect(result.filter.quantity.$in[1]).to.equal(50);
        });

        it(`Should work with a all the special characters`, () => {
            const mapper = createQueryStringMapper(schema);
            const date = new Date().toISOString();
            const qsObj = {
                filter: {
                    type: `public`,
                    count: { $gt: 5 },
                    rating: { $gte: 9.5 },
                    createdAt: { $lt: date },
                    score: { $lte: -5 },
                    status: { $ne: `success` },
                    country: { $in: [`GB`, `US`] },
                    lang: { $nin: [`fr`, `en`] },
                    phone: { $exists: true },
                    email: { $exists: false },
                    email2: /@gmail.com$/i,
                    phone2: { $not: /^06/ },
                    nestedObj: {
                        type: `public`,
                        count: { $gt: 5 },
                        rating: { $gte: 9.5 },
                        createdAt: { $lt: date },
                        score: { $lte: -5 },
                        status: { $ne: `success` },
                        country: { $in: [`GB`, `US`] },
                        lang: { $nin: [`fr`, `en`] },
                        phone: { $exists: true },
                        email: { $exists: false },
                        email2: /@gmail.com$/i,
                        phone2: { $not: /^06/ },
                        deeplyNestedObj: {
                            type: `public`,
                            count: { $gt: 5 },
                            rating: { $gte: 9.5 },
                            createdAt: { $lt: date },
                            score: { $lte: -5 },
                            status: { $ne: `success` },
                            country: { $in: [`GB`, `US`] },
                            lang: { $nin: [`fr`, `en`] },
                            phone: { $exists: true },
                            email: { $exists: false },
                            email2: /@gmail.com$/i,
                            phone2: { $not: /^06/ },
                        },
                    },
                },
            };
            const result = mapper(qsObj);
            expect(result).to.be.ok;
            expect(result.filter.type).to.eql(`public`);
            expect(result.filter.count).to.eql({ $gt: 5 });
            expect(result.filter.rating).to.eql({ $gte: 9.5 });
            expect(result.filter.createdAt).to.eql({ $lt: date });
            expect(result.filter.score).to.eql({ $lte: -5 });
            expect(result.filter.status).to.eql({ $ne: `success` });
            expect(result.filter.country).to.eql({ $in: [`GB`, `US`] });
            expect(result.filter.lang).to.eql({ $nin: [`fr`, `en`] });
            expect(result.filter.phone).to.eql({ $exists: true });
            expect(result.filter.email).to.eql({ $exists: false });
            expect(result.filter.email2).to.eql(/@gmail.com$/i);
            expect(result.filter.phone2).to.eql({ $not: /^06/ });
            expect(result.filter.type).to.eql(`public`);
            //
            expect(result.filter[`nestedObj.type`]).to.eql(`public`);
            expect(result.filter[`nestedObj.count`]).to.eql({ $gt: 5 });
            expect(result.filter[`nestedObj.rating`]).to.eql({ $gte: 9.5 });
            expect(result.filter[`nestedObj.createdAt`]).to.eql({ $lt: date });
            expect(result.filter[`nestedObj.score`]).to.eql({ $lte: -5 });
            expect(result.filter[`nestedObj.status`]).to.eql({ $ne: `success` });
            expect(result.filter[`nestedObj.country`]).to.eql({ $in: [`GB`, `US`] });
            expect(result.filter[`nestedObj.lang`]).to.eql({ $nin: [`fr`, `en`] });
            expect(result.filter[`nestedObj.phone`]).to.eql({ $exists: true });
            expect(result.filter[`nestedObj.email`]).to.eql({ $exists: false });
            expect(result.filter[`nestedObj.email2`]).to.eql(/@gmail.com$/i);
            expect(result.filter[`nestedObj.phone2`]).to.eql({ $not: /^06/ });
        });

        it.skip(`Should allow for regex conversions`, () => {
            const mapper = createQueryStringMapper(schema);
            const qsObj = {
                filter: {
                    email2: /@gmail.com$/i.toString(),
                },
            };
            let qsOverWire = qs.stringify(qsObj);
            let qsDecoded = qs.parse(qsOverWire);
            const result = mapper(qsDecoded);
            expect(result).to.be.ok;
            expect(result.filter.email2).to.eql(/@gmail.com$/i);
        });

        it(`Should support multiple types in the schema`, () => {
            const multiType = {
                name: `users`,
                properties: {
                    value1: {
                        type: [`string`, `number`],
                    },
                    value2: {
                        type: [`string`],
                    },
                },
            };
            const mapper = createQueryStringMapper(multiType);
            const queryString = `value1=1&value2=2`;
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter.value1).to.eql(1);
            expect(result.filter.value2).to.eql(`2`);
        });

        it(`Should cast based on a nested property in a schema`, () => {
            const multiType = {
                name: `users`,
                properties: {
                    sub: {
                        type: `object`,
                        properties: {
                            sub: {
                                type: `object`,
                                properties: {
                                    value: {
                                        type: [`string`],
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const mapper = createQueryStringMapper(multiType);
            const queryString = `sub.sub.value=1`;
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter[`sub.sub.value`]).to.eql(`1`);
        });

        it(`Should support casting to boolean`, () => {
            const castTypeSchema = {
                name: `users`,
                properties: {
                    value: {
                        type: `boolean`,
                    },
                },
            };
            const mapper = createQueryStringMapper(castTypeSchema);
            const queryString = {
                filter: {
                    value: true,
                },
            };
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter.value).to.eql(true);
        });

        it(`Should work for nested string properties`, () => {
            const multiType = {
                name: `users`,
                properties: {
                    value1: {
                        type: `object`,
                        properties: {
                            value2: {
                                type: [`string`],
                            },
                        },
                    },
                },
            };
            const mapper = createQueryStringMapper(multiType);
            const queryString = `value1.value2=2`;
            const result = mapper(queryString);
            expect(result).to.be.ok;
            expect(result.filter[`value1.value2`]).to.eql(`2`);
        });
    });
});
