'use strict';
module.exports = function() {
    return {
        logging: {
            pino: {
                level: 'info',
                prettyPrint: false,
            },
        },
        errorHandling: {
            exposeServerErrorMessages: false,
            exposeErrorRoutes: false,
        },
        'json spaces': 0,
        firebase: {
            runningOnGoogleCloudFunction: true,
        },
    };
};
