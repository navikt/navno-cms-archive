import express from 'express';
import compression from 'compression';
import { setupErrorHandlers } from './routing/errorHandlers';
import { validateEnv } from './utils/validateEnv';
import { setupInternalRoutes } from './routing/internal';
import { setupSites } from './routing/site';

const { APP_PORT } = process.env;

validateEnv()
    .then(async () => {
        const app = express().use(compression(), express.json());

        setupInternalRoutes(app);
        await setupSites(app);
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
