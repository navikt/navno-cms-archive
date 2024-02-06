import { Express } from 'express';
import { CmsArchiveSite, CmsArchiveSiteConfig } from '../cms/CmsArchiveSite';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import { initAndGetRenderer } from '../ssr/initRenderer';
import puppeteer from 'puppeteer';

const archiveConfigs: CmsArchiveSiteConfig[] = [
    {
        name: 'Selvbetjeningssonen',
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
    },
    {
        name: 'Fagsystemsonen',
        basePath: '/fss',
        indexPrefix: 'cmsfss',
    },
] as const;

export const setupCmsArchiveSites = async (expressApp: Express) => {
    const opensearchClent = new CmsArchiveOpenSearchClient();
    const htmlRenderer = await initAndGetRenderer(expressApp);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/.chromium'],
    });

    const sites = archiveConfigs.map((config) => {
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
        return res.redirect('/sbs');
    });
};
