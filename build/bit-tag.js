'use strict';
const util = require('util');
const { exec } = require('child_process');
const version = require('../package.json').version;
const execute = util.promisify(exec);
(async function run() {
    console.log(`Setting version number to ${version}`);
    try {
        const { stdout: bitTagOutput } = await execute(`bit tag --all ${version} --force`);
        if (bitTagOutput) {
            console.log(bitTagOutput);
            if (bitTagOutput.toLowerCase().indexOf('nothing to tag') >= 0) {
                return;
            }
        }
        const { stdout: npmCommitOutput } = await execute('npm run bit-commit');
        console.log(npmCommitOutput);
    } catch (err) {
        console.error(err);
    }
})();
