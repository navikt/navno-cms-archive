import { Express } from 'express';
import { initAndGetRenderer } from '../ssr/initRenderer';

export const setupSite = async (expressApp: Express) => {
    const htmlRenderer = await initAndGetRenderer(expressApp);

    expressApp.get('/', (req, res) => {
        return res.redirect('/xp');
    });

    expressApp.get('/xp', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        return res.send(html);
    });
};
