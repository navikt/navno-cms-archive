import { Router } from 'express';
import { render } from '../_ssr-dist/main-server';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';
import { ContentTreeService } from '../services/ContentTreeService';
import { ContentService } from '../services/ContentService';
import { ContentIconService } from 'services/ContentIconService';
import { AttachmentService } from '../services/AttachmentService';
import { PdfService } from '../services/PdfService';
import puppeteer from 'puppeteer';

export const setupSite = async (router: Router) => {
    const htmlRenderer = await buildHtmlRenderer({
        router: router,
        appHtmlRenderer: render,
        appBaseBath: process.env.APP_BASEPATH,
        ssrModulePath: '/client/main-server.tsx',
    });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'],
    });

    router.get('/', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        return res.send(html);
    });

    const contentService = new ContentService();
    const contentTreeService = new ContentTreeService();
    const contentIconService = new ContentIconService();
    const attachmentService = new AttachmentService();
    const pdfService = new PdfService({ browser, contentService });

    router.get('/html/:versionKey/:locale?', async (req, res, next) => {
        const { versionKey, locale } = req.params;

        const version = await contentService.fetchContent(versionKey, locale || 'no');
        if (!version) {
            return next();
        }

        if (!version.html) {
            return res
                .status(406)
                .send(`Content with version key ${versionKey} does not have html content`);
        }

        return res.send(version.html);
    });
    router.get('/api/content', contentService.getContentHandler);
    router.get('/api/contentTree', contentTreeService.getContentTreeHandler);
    router.get('/api/contentIcon', contentIconService.getContentIconHandler);
    router.get('/api/attachment', attachmentService.getAttachmentHandler);
    router.get('/api/pdf', pdfService.generatePdfHandler);
};
