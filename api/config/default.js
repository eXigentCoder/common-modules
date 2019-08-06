'use strict';

const reqCorrelationHeaderName = `X-Request-ID`;
const resCorrelationHeaderName = reqCorrelationHeaderName;
const reqCorrelationIdParamName = `requestId`;
const _ = require(`lodash`);
const host = `localhost`;
const port = 3037;
const packageJson = require(`../package.json`);

module.exports = function() {
    return {
        scheme: `http`,
        host,
        port,
        paginate: {
            default: 10,
            max: 50,
        },
        errorHandling: {
            exposeServerErrorMessages: true,
            exposeErrorRoutes: true,
        },
        logging: {
            pino: {
                level: `trace`,
                prettyPrint: {
                    translateTime: `SYS:standard`,
                },
            },
            correlationId: {
                // Sets up the rules for applying a correlation id to each request for tracking across async jobs in logs. See https://www.npmjs.com/package/request-id.
                reqHeader: reqCorrelationHeaderName, // The incoming request header to look at for the correlation id.
                resHeader: resCorrelationHeaderName, // The response header to set for the correlation id.
                paramName: reqCorrelationIdParamName, // The parameter in the query string to use to find the correlation id as well as the parameter on req to set to the correlation id.
            },
            serializers: {
                req: function reqSerializer(req) {
                    return {
                        id: req.id,
                        correlationId: req.headers[reqCorrelationHeaderName],
                        method: req.method,
                        url: req.url,
                        body: req.raw.body,
                        query: req.raw.query,
                        headers: req.headers,
                    };
                },
                res: function resSerializer(res) {
                    return {
                        statusCode: res.statusCode,
                        headers: convertHeaderStringToObject(res.raw._header),
                    };
                },
            },
        },
        expressApp: {
            trustProxy: false, // todo Used for if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc). See https://expressjs.com/en/guide/behind-proxies.html
            jsonSpaces: 0, // when you do res.json({...}) this value controls the spacing when stringifying.
            routerOptions: {
                mergeParams: true, // Allows routers to inherit parameters from their ancestor routes.
            },
            corsOptions: {
                origin: [host + `:` + port],
            },
            helmetOptions: {
                //todo setup security options, see https://www.npmjs.com/package/helmet
                contentSecurityPolicy: {
                    // loading resources
                    directives: {
                        defaultSrc: [`'self'`], //todo only allow resources (css, js, html, etc) from our api.
                        styleSrc: [`'self'`, `'unsafe-inline'`], // inline css and css sections in headers.
                        imgSrc: [`'self'`, `data:`],
                        scriptSrc: [`'self'`, `'unsafe-inline'`],
                        fontSrc: [`'self'`, `data:`],
                        reportUri: `/report-violation`, // CSP violations will be posted here (server) from the browser.
                    },
                },
                frameguard: {
                    // iframe related security
                    action: `sameorigin`, //todo only allows iframes from the same domain with this option
                },
                // hpkp: { // todo pins the public key of your https cert to prevent man-in-the-middle attacks
                //     maxAge: 7776000, // ninetyDaysInSeconds
                //     sha256s: ['AbCdEf123=', 'ZyXwVu456='], set keys here
                //     includeSubdomains: true // only set to true if you are using subdomains
                // },
                // hsts: { //todo tells the browser to stick to  https, set this once you have https setup
                //     maxAge: 5184000 // sixtyDaysInSeconds
                // },
                noCache: false, //set to true to ensure the browser doesn't cache things, can prevent old stale code from not refreshing on deploy
            },
            rateLimits: {
                // Rate limits and throttling using https://www.npmjs.com/package/express-brute
                default: {
                    freeRetries: 1000, //The number of retires the user has before they need to start waiting (default: 2)
                    minWait: 60 * 1000, //The initial wait time (in milliseconds) after the user runs out of retries (default: 500 milliseconds)
                    maxWait: 60 * 1000, //The maximum amount of time (in milliseconds) between requests the user needs to wait (default: 15 minutes). The wait for a given request is determined by adding the time the user needed to wait for the previous two requests.
                    //lifetime: 60, //The length of time (in seconds since the last request) to remember the number of requests that have been made by an IP. By default it will be set to maxWait * the number of attempts before you hit maxWait to discourage simply waiting for the lifetime to expire before resuming an attack. With default values this is about 6 hours.
                },
                // ,api: {
                //     Override defaults for api here
                // }
                // ,authenticate: {
                //     Override defaults for authenticate here
                // }
            },
        },
        firebase: {
            runningOnGoogleCloudFunction: false,
        },
        mongoDb: {
            urlConfig: {
                username: ``,
                password: ``,
                server: `localhost`,
                dbName: `${packageJson.name}-${process.env.NODE_ENV}`,
            },
            clientOptions: {
                appname: packageJson.name,
            },
        },
    };
};

function convertHeaderStringToObject(header) {
    const headers = {};
    const pairs = header.split(`\r\n`);
    pairs.forEach(pair => {
        const parts = pair.split(`:`);
        if (!_.isNil(parts[0]) && !_.isNil(parts[1])) {
            headers[parts[0].trim()] = parts[1].trim();
        }
    });
    return headers;
}
