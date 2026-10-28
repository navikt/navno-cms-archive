import express from 'express';
import compression from 'compression';
import { setupSite } from './routing/site';
import { setupNaisProbeHandlers } from '@common/server/routing/internal';
import { startServer } from '@common/server/startServer';
import { setupErrorHandlers } from '@common/server/routing/errorHandlers';

// Sikkerhetsnett: puppeteer sin CDP-sesjon kan avvise interne callbacks (f.eks. ved
// TargetCloseError) via en promise som ikke inngår i vår egen await-kjede – Node
// terminerer da hele prosessen som standard, selv om feilen er begrenset til én
// snapshot-rendering. Denne loggingen forhindrer at prosessen krasjer for slikt.
// NB: dekker IKKE genuint ufangede exceptions (uncaughtException) – etter en slik kan
// prosess-tilstanden være korrupt, så vi lar Node avslutte normalt i det tilfellet.
process.on('unhandledRejection', (reason) => {
    console.error(
        `Unhandled rejection (fanget, prosessen fortsetter): ${
            reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)
        }`
    );
});

const expectedEnv = [
    'NODE_ENV',
    'APP_PORT',
    'APP_BASEPATH',
    'VITE_APP_ORIGIN',
    'XP_ORIGIN',
    'SERVICE_SECRET',
    'HTML_RENDER_API',
] as const;

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
        setupErrorHandlers(router);

        return app;
    },
});
