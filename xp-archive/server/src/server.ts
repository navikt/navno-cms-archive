import express from 'express';
import compression from 'compression';
import { setupSite } from './routing/site';
import { validateEnv } from '@common/server/utils/validateEnv';
import { setupNaisProbeHandlers } from '@common/server/routing/internal';
import { createHttpTerminator } from 'http-terminator';

const expectedEnv = ['NODE_ENV', 'APP_PORT', 'APP_BASEPATH', 'APP_ORIGIN'] as const;

validateEnv(expectedEnv)
    .then(async () => {
        const app = express().use(compression(), express.json());

        const router = express.Router();
        app.use(process.env.APP_BASEPATH, router);

        app.use('/', (req, res) => {
            return res.redirect(process.env.APP_BASEPATH);
        });

        setupNaisProbeHandlers(router);
        await setupSite(router);

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

        const httpTerminator = createHttpTerminator({ server });

        const shutdown = () => {
            console.log('Server shutting down');
            httpTerminator.terminate().then(() => {
                server.close(() => {
                    console.log('Shutdown complete!');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    });
