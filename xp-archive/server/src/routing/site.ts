import { Router } from 'express';
// @ts-expect-error - Generated SSR file without type declarations
import { render } from '../_ssr-dist/main-server';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';
import { ContentTreeService } from '../services/ContentTreeService';
import { ContentService } from '../services/ContentService';
import { ContentIconService } from 'services/ContentIconService';
import { AttachmentService } from '../services/AttachmentService';
import { PdfService } from '../services/PdfService';
import { BrowserManager } from '../services/BrowserManager';
import { SearchService } from 'services/SearchService';
import { IndexingService } from '../services/IndexingService';
import { BackfillService } from '../services/BackfillService';
import { XpArchiveOpenSearchClient } from '../opensearch/XpArchiveOpenSearchClient';
import { HtmlRenderer } from '../../../../common/src/server/ssr/htmlRenderer';

export const setupSite = async (router: Router) => {
    const htmlRenderer = await buildHtmlRenderer({
        router: router,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        appHtmlRenderer: render,
        appBaseBath: process.env.APP_BASEPATH,
        ssrModulePath: '/client/main-server.tsx',
    });

    router.get('/', async (req, res) => {
        const html = await htmlRenderer(req.url, {});
        res.send(html);
    });

    await setupApiRoutes(router);
    setupBrowserRoutes(router, htmlRenderer);
};

const setupApiRoutes = async (router: Router) => {
    const browserManager = await BrowserManager.create();
    const openSearchClient = new XpArchiveOpenSearchClient();

    const contentService = new ContentService();
    const contentTreeService = new ContentTreeService(openSearchClient);
    const contentIconService = new ContentIconService();
    const attachmentService = new AttachmentService();
    const pdfService = new PdfService({ browserManager, contentService });
    const searchService = new SearchService(openSearchClient);
    const indexingService = new IndexingService(contentService, openSearchClient, browserManager);
    const backfillService = new BackfillService(indexingService);
    router.get('/api/content', contentService.getContentHandler);
    router.get('/api/contentTree', contentTreeService.getContentTreeHandler); //TODO: slette? evt. også rename contentTreeFromIndex til contentTree
    router.get('/api/contentTreeFromIndex', contentTreeService.getContentTreeFromIndexHandler);
    router.get('/api/contentIcon', contentIconService.getContentIconHandler);
    router.get('/api/attachment', attachmentService.getAttachmentHandler);
    router.get('/api/pdf', pdfService.generatePdfHandler);
    router.get('/api/search', searchService.getSearchHandler);
    router.post('/api/index', indexingService.indexContentHandler);
    router.post('/api/backfill', backfillService.backfillHandler);
};

const setupBrowserRoutes = (router: Router, htmlRenderer: HtmlRenderer) => {
    const contentService = new ContentService();

    router.get('/html/:contentId/:locale', async (req, res, next) => {
        const { contentId, locale } = req.params;

        const content = await contentService.fetchContent(contentId, locale);
        if (!content) {
            next();
            return;
        }

        if (!content.html) {
            res.status(406).send('This content does not have an html representation.');
            return;
        }

        res.send(content.html);
    });

    router.get('/html/:contentId/:locale/:versionId', async (req, res, next) => {
        const { contentId, locale, versionId } = req.params;

        const content = await contentService.fetchContent(contentId, locale, versionId);
        if (!content) {
            next();
            return;
        }

        if (!content.html) {
            res.status(406).send('This content does not have an html representation.');
            return;
        }

        res.send(content.html);
    });

    router.get('/:contentId/:locale', async (req, res, next) => {
        const { contentId, locale } = req.params;

        const content = await contentService.fetchContent(contentId, locale);
        if (!content) {
            next();
            return;
        }

        const contextContent = {
            ...content,
            html: undefined,
        };

        const html = await htmlRenderer(req.url, { content: contextContent });
        res.send(html);
    });

    router.get('/:contentId/:locale/:versionId', async (req, res, next) => {
        const { contentId, locale, versionId } = req.params;

        const content = await contentService.fetchContent(contentId, locale, versionId);
        if (!content) {
            next();
            return;
        }

        const contextContent = {
            ...content,
            html: undefined,
        };

        const html = await htmlRenderer(req.url, { content: contextContent });
        res.send(html);
    });
};
