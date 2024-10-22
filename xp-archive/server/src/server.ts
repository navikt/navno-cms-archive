import express from 'express';
import compression from 'compression';
import { setupSite } from './routing/site';
import { setupNaisProbeHandlers } from '@common/server/routing/internal';
import { startServer } from '@common/server/startServer';

const expectedEnv = ['NODE_ENV', 'APP_PORT', 'APP_BASEPATH', 'APP_ORIGIN', 'XP_ORIGIN'] as const;

startServer({
    envKeys: expectedEnv,
    port: Number(process.env.APP_PORT),
    initApp: async () => {
        const app = express().use(compression(), express.json());

        const router = express.Router();
        app.use(process.env.APP_BASEPATH, router);

        app.use('/', (req, res) => {
            return res.redirect(process.env.APP_BASEPATH);
        });

        setupNaisProbeHandlers(router);
        await setupSite(router);

        return app;
    },
});
