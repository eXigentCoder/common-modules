'use strict';
const { logger, config } = require('./env-init');
const packageJson = require('../package.json');
const app = require('./express/app');
const port = config.get('port');

app.listen(port, function() {
    logger.info(
        `${packageJson.name} is listening at http://${config.get(
            'host'
        )}:${port}`
    );
});
