import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

import express from 'express';
import compression from 'compression';
import { setupErrorHandlers } from './routing/errorHandlers';
import { validateEnv } from './utils/validateEnv';
import { setupInternalRoutes } from './routing/internal';
import { setupCmsArchiveSites } from './routing/site';

const { APP_PORT, APP_BASEPATH, APP_ORIGIN } = process.env;

console.log(
    `Initializing server on ${APP_ORIGIN}${APP_BASEPATH} with port ${APP_PORT}`
);

validateEnv()
    .then(async () => {
        const app = express().use(compression(), express.json());

        setupInternalRoutes(app);
        await setupCmsArchiveSites(app);
        setupErrorHandlers(app);

        return app;
    })
    .catch((e) => {
        console.error(`Error occured while initializing server! - ${e}`);
        throw e;
    })
    .then((app) => {
        const server = app.listen(APP_PORT, () => {
            console.log(`Server starting on port ${APP_PORT}`);
        });

        const shutdown = () => {
            console.log('Server shutting down');

            server.close(() => {
                console.log('Shutdown complete!');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    });
