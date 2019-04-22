## Lerna

This project uses [Lerna](https://github.com/lerna/lerna)

## Using the private NPM registry

Recommended (for Windows users):Install and run the auth helper

`npm install -g vsts-npm-auth --registry https://registry.npmjs.com --always-auth false`
`vsts-npm-auth -config .npmrc`

This should pop up a window to log in to the organisation.


# bit.dev

`bit add src/common-errors/* --main src/common-errors/{PARENT}/{PARENT}.js --tests src/common-errors/{PARENT}/*.test.js --namespace common-errors`