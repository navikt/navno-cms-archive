import { Express } from 'express';
import { CmsArchiveSite } from '../cms/CmsArchiveSite';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import { render } from '../_ssr-dist/main-server';
import puppeteer from 'puppeteer';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { buildHtmlRenderer } from '@common/server/ssr/initRenderer';
import { setupErrorHandlers } from '@common/server/routing/errorHandlers';

export const setupSites = async (expressApp: Express) => {
    const opensearchClent = new CmsArchiveOpenSearchClient();

    const htmlRenderer = await buildHtmlRenderer({
        router: expressApp,
        appHtmlRenderer: render,
        appBaseBath: process.env.APP_BASEPATH,
        ssrModulePath: '/client/main-server.tsx',
    });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'],
    });

    const sites = legacyArchiveConfigs.map((config) => {
        return new CmsArchiveSite({
            config,
            expressApp,
            client: opensearchClent,
            htmlRenderer,
            browser,
        });
    });

    await Promise.all(sites.map((site) => site.init()));

    expressApp.get('/', (req, res) => {
        return res.redirect(xpArchiveConfig.basePath);
    });

    setupErrorHandlers(expressApp);
};
