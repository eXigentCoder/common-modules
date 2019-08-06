'use strict';
const config = require(`../config/config`);
const admin = require(`firebase-admin`);
const functions = require(`firebase-functions`);

const firebaseSettings = config.get(`firebase`);
if (firebaseSettings.runningOnGoogleCloudFunction) {
    admin.initializeApp(functions.config().firebase);
} else {
    const serviceAccount = require(`../../google-service-account-key.json`);
    admin.initializeApp({
        // @ts-ignore
        credential: admin.credential.cert(serviceAccount),
    });
}
module.exports = { admin };
