import { Router } from 'express';
import { isReadyHandler } from './routes/internal/isReady/isReadyHandler';
import { isAliveHandler } from './routes/internal/isAlive/isAliveHandler';
import { OpenSearchClient } from './opensearch/client';

export const setupApiRoutes = async (router: Router) => {
    router.get('/internal/isAlive', isAliveHandler);
    router.get('/internal/isReady', isReadyHandler);
    router.get('/opensearch/test', async (req, res) => {
        const client = new OpenSearchClient();

        return res.send(await client.test())
    })
};
