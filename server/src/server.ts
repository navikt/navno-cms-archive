import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

import express from 'express';
import compression from 'compression';
import { setupSiteRoutes } from './site/setupSiteRoutes';
import { setupApiRoutes } from './api/setupApiRoutes';
import { setupErrorHandlers } from './utils/errorHandlers';

const APP_PORT = '3399';

const app = express();

app.use(compression(), express.json());

const siteRouter = express.Router();
const apiRouter = express.Router();

app.use('/', siteRouter);

siteRouter.use('/api', apiRouter);

setupApiRoutes(apiRouter)
    .then(() => setupSiteRoutes(siteRouter))
    .then(() => setupErrorHandlers(app))
    .catch((e) => {
        console.error(`Error occured while initializing server! - ${e}`);
        throw e;
    })
    .then(() => {
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
