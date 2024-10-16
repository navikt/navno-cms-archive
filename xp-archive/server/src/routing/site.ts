import { Express } from 'express';
import { render } from '../_ssr-dist/main-server';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';

export const setupSite = async (expressApp: Express) => {
    const htmlRenderer = await buildHtmlRenderer({
        expressApp,
        appHtmlRenderer: render,
        appBaseBath: process.env.APP_BASEPATH as string,
        ssrModulePath: '/client/main-server.tsx',
    });

    expressApp.get('/', (req, res) => {
        return res.redirect('/xp');
    });

    expressApp.get('/xp', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        return res.send(html);
    });
};
