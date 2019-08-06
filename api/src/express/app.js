'use strict';
require(`../error-handling/process-events`);
const express = require(`express`);
const cors = require(`cors`);
const helmet = require(`helmet`);
const bodyParser = require(`body-parser`);
const logger = require(`../logging/logger`);
const config = require(`../config/config`);

const registerRoutes = require(`./routes`);
const createExpressPinoLogger = require(`express-pino-logger`);

const loggingOptions = config.get(`logging`);
const appSettings = config.get(`expressApp`);
const app = express();
app.set(`json spaces`, appSettings.jsonSpaces);
app.set(`trust proxy`, appSettings.trustProxy);
app.use(helmet(appSettings.helmetOptions));
app.use(cors(appSettings.corsOptions));
app.use(bodyParser.json());
app.use(
    createExpressPinoLogger({
        logger: logger.pino(),
        serializers: loggingOptions.serializers,
    })
);
registerRoutes(app);
module.exports = app;
