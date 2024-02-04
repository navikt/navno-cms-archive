import { Express } from 'express';
import { CmsArchiveSite, CmsArchiveSiteConfig } from '../cms/CmsArchiveSite';
import { CmsArchiveOpenSearchClient } from '../opensearch/CmsArchiveOpenSearchClient';
import { initAndGetRenderer } from '../site/ssr/initRenderer';

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
    const archiveClient = new CmsArchiveOpenSearchClient();
    const htmlRenderer = await initAndGetRenderer(expressApp);

    const sites = archiveConfigs.map((config) => {
        return new CmsArchiveSite({
            config,
            expressApp,
            dbClient: archiveClient,
            htmlRenderer,
        });
    });

    await Promise.all(sites.map((site) => site.init()));

    expressApp.get('/', (req, res) => {
        return res.redirect('/sbs');
    });
};
