'use strict';
//const util = require(`util`);
const { spawn } = require(`child_process`);
const version = require(`../package.json`).version;

const command = `bit tag --all ${version} --force --skip-tests`;
console.log(`[Bit Tag]: ${command}`);

const parts = command.split(` `);
const first = parts.shift();
const proc = spawn(first, parts, { shell: true });

proc.stderr.on(`data`, function(data) {
    console.error(`[Bit Tag]: ${data.toString()}`);
});

proc.stdout.on(`data`, (data) => {
    console.log(`[Bit Tag]: ${data.toString()}`);
});

proc.on(`exit`, function(code) {
    if(code === 0){
        console.log(`Done`);
    }
    // eslint-disable-next-line no-process-exit
    process.exit(code);
});
