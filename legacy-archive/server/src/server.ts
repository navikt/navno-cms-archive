import express from 'express';
import compression from 'compression';
import { setupSites } from './routing/site';
import { setupNaisProbeHandlers } from '@common/server/routing/internal';
import { startServer } from '@common/server/startServer';
import * as process from 'node:process';

const expectedEnv = [
    'NODE_ENV',
    'APP_PORT',
    'APP_BASEPATH',
    'APP_ORIGIN',
    'OPEN_SEARCH_URI',
    'OPEN_SEARCH_USERNAME',
    'OPEN_SEARCH_PASSWORD',
] as const;

startServer({
    envKeys: expectedEnv,
    port: Number(process.env.APP_PORT),
    initApp: async () => {
        const app = express().use(compression(), express.json());

        setupNaisProbeHandlers(app);
        await setupSites(app);

        return app;
    },
});
