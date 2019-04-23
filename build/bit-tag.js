'use strict';
const { exec } = require('child_process');
const version = require('../package.json').version;

const options = {};
console.log(`Setting version number to ${version}`);
exec(`bit tag --all --force ${version}`, options, function(err, stdout, stderr) {
    if (stdout) {
        console.log(stdout);
        if (stdout.toLowerCase().indexOf('nothing to tag') >= 0) {
            throw new Error(stdout);
        }
    }
    if (stderr) {
        console.error(stderr);
    }
    if (err) {
        throw err;
    }
});
