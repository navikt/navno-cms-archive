import express from 'express';
import compression from 'compression';
import { setupSites } from './routing/site';
import { validateEnv } from '@common/server/utils/validateEnv';
import { setupNaisProbeHandlers } from '@common/server/routing/internal';

const expectedEnv = [
    'NODE_ENV',
    'APP_PORT',
    'APP_BASEPATH',
    'APP_ORIGIN',
    'OPEN_SEARCH_URI',
    'OPEN_SEARCH_USERNAME',
    'OPEN_SEARCH_PASSWORD',
] as const;

validateEnv(expectedEnv)
    .then(async () => {
        const app = express().use(compression(), express.json());

        setupNaisProbeHandlers(app);
        await setupSites(app);

        return app;
    })
    .catch((e) => {
        console.error(`Error occured while initializing server! - ${e}`);
        throw e;
    })
    .then((app) => {
        const { APP_PORT } = process.env;

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
