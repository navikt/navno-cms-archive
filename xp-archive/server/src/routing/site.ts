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
        appBaseBath: process.env.APP_BASEPATH,
        ssrModulePath: '/client/main-server.tsx',
    });

    router.get('/', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        return res.send(html);
    });

    const contentService = new ContentService();
    const contentTreeService = new ContentTreeService();
    const contentIconService = new ContentIconService();

    router.get('/api/content', contentService.getContentHandler);
    router.get('/api/contentTree', contentTreeService.getContentTreeHandler);
    router.get('/api/contentIcon', contentIconService.getContentIconHandler);
};
