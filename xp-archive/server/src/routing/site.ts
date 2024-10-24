import { Router } from 'express';
import { render } from '../_ssr-dist/main-server';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';
import { ContentTreeService } from '../services/ContentTreeService';
import { ContentService } from '../services/ContentService';

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

    router.get('/api/content', contentService.getContentHandler);
};
