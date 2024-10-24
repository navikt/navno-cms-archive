import { Router } from 'express';
import { render } from '../_ssr-dist/main-server';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';
import { ContentTreeService } from '../services/ContentTreeService';
import { ContentService } from '../services/ContentService';
import { ContentIconService } from 'services/ContentIconService';

export const setupSite = async (router: Router) => {
    const htmlRenderer = await buildHtmlRenderer({
        router: router,
        appHtmlRenderer: render,
        appBaseBath: process.env.APP_BASEPATH as string,
        ssrModulePath: '/client/main-server.tsx',
    });

    router.get('/', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        return res.send(html);
    });

    const contentTreeService = new ContentTreeService();

    router.get('/api/contentTree', async (req, res) => {
        const { path } = req.query;

        if (typeof path !== 'string') {
            return res.status(400).send('Parameter path is required');
        }

        const contentTreeResponse = await contentTreeService.getContentTree(path);

        return res.status(200).json(contentTreeResponse);
    });

    const contentService = new ContentService();

    router.get('/api/content', async (req, res) => {
        const { id, locale } = req.query;

        if (typeof id !== 'string' || typeof locale !== 'string') {
            return res.status(400).send('Parameters id and locale are required');
        }

        const contentResponse = await contentService.getCurrentContent(id, locale);

        return res.status(200).json(contentResponse);
    });

    const contentIconService = new ContentIconService();

    router.get('/api/contentIcon', async (req, res) => {
        const { type } = req.query;
        if (typeof type !== 'string') {
            return res.status(400).send('Parameter type is required');
        }

        const contentIconResponse = await contentIconService.getContentIcon(type);

        const body = await contentIconResponse.arrayBuffer();

        return res
            .status(200)
            .setHeader('content-type', contentIconResponse.headers.get('content-type') ?? '')
            .send(Buffer.from(body));
    });
};
