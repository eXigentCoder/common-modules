'use strict';
const { isBoom, boomify } = require(`@hapi/boom`);
const { KrimZenNinjaBaseError } = require(`../common-errors`);
module.exports = azureWrapper;

/**
 * @param {import('./types').RequestHandler} fn
 * @returns {import('./types').AzureWebRequest}
 */
function azureWrapper(fn, convertAzureContextToExecutionContext) {
    return _azureWrapper;
    /**
     * @param {import('./types').AzureContext} context
     * @param {import('./types').HttpRequest} req
     * @returns {Promise<import('./types').HttpResponse>}
     */
    async function _azureWrapper(context, req) {
        try {
            const executionContext = await convertAzureContextToExecutionContext(context);
            const result = await fn({
                context: executionContext,
                req,
                logger: context.log,
                rawContext: context,
            });
            return {
                status: 200,
                body: result,
                enableContentNegotiation: true,
            };
        } catch (err) {
            context.log.error(err);
            let boomErr;
            if (err instanceof KrimZenNinjaBaseError) {
                boomErr = ConvertKnToBoom(err);
            }
            if (isBoom(err)) {
                boomErr = err;
                if (boomErr.data) {
                    //@ts-ignore
                    boomErr.output.payload.data = boomErr.data;
                }
            } else {
                boomErr = boomify(err, { statusCode: err.statusCode || 500 });
            }

            return {
                status: boomErr.output.statusCode,
                body: boomErr.output.payload,
                headers: boomErr.output.headers,
                enableContentNegotiation: true,
            };
        }
    }
}

function ConvertKnToBoom(err) {
    if (err.safeToShowToUsers) {
        const boomified = boomify(err, {
            statusCode: err.httpStatusCode,
        });
        const payload = boomified.output.payload;
        // @ts-ignore
        payload.code = err.code;
        // @ts-ignore
        payload.name = err.name;
        if (err.decorate) {
            Object.getOwnPropertyNames(err.decorate).forEach(
                key => (payload[key] = err.decorate[key])
            );
        }
        if (err.innerError) {
            // @ts-ignore
            payload.innerErr = err.innerError;
        }
        return boomified;
    }
    return boomify(err, {
        statusCode: err.httpStatusCode,
    });
}
