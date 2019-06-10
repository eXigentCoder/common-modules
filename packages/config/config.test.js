'use strict';

describe(`Config`, () => {
    process.env.NODE_ENV = `test`;
    it(`should merge in the values based on the NODE_ENV value`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        config.initialise(appName);
        expect(config.get(`isAwesome`)).to.equal(true);
    });
    it(`should should include the source name in the config.`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        config.initialise(appName);
        expect(config.get(`name`)).to.equal(appName);
    });
    it(`should should include the NODE_ENV value in the config.`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        config.initialise(appName);
        expect(config.get(`NODE_ENV`)).to.equal(`test`);
    });
    it(`should should throw an error if no source is provided.`, () => {
        const config = require(`.`);
        expect(() => config.initialise()).to.throw();
    });
    it(`should should throw an error if source is not a string.`, () => {
        const config = require(`.`);
        const appName = 42;
        expect(() => config.initialise(appName)).to.throw();
    });
    it(`should export the get method.`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        config.initialise(appName);
        expect(config.get(`isAwesome`)).to.equal(true);
    });
    it(`should support the older node module format`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        process.env.NODE_ENV = `old`;
        config.initialise(appName);
        process.env.NODE_ENV = `test`;
        expect(config.get(`isAwesome`)).to.equal(42);
    });
    it(`should export throw an error if the config file does not export a function or object`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        process.env.NODE_ENV = `fake`;
        expect(() => config.initialise(appName)).to.throw();
        process.env.NODE_ENV = `test`;
    });
    it(`should allow you to specify a different path, relative to the cwd, to the config folder`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        const options = {
            name: appName,
            configPath: `config-custom/more`,
        };
        config.initialise(options);
        expect(config.get(`isAwesome`)).to.equal(`pimpMyRide`);
    });
    it(`should allow you to just pass in a string if no other options are required`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        config.initialise(appName);
        expect(config.get(`isAwesome`)).to.equal(true);
    });
    it(`should allow files that export an object instead of a function`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        process.env.NODE_ENV = `object`;
        config.initialise(appName);
        process.env.NODE_ENV = `test`;
        expect(config.get(`isAwesome`)).to.equal(`object`);
    });
    it(`should allow files that export an object instead of a function`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        process.env.NODE_ENV = `json`;
        config.initialise(appName);
        process.env.NODE_ENV = `test`;
        expect(config.get(`isAwesome`)).to.equal(`json`);
    });
    it(`should not throw an error if the config file does not exist`, () => {
        const config = require(`.`);
        const appName = `someApplication`;
        process.env.NODE_ENV = `zomg-does-not-exit`;
        config.initialise(appName);
        expect(config.get(`isAwesome`)).to.equal(false);
    });
});
