import { Express } from 'express';
import { CmsArchiveSite } from '../cms/CmsArchiveSite';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import { initAndGetRenderer } from '../site/ssr/initRenderer';

export const setupCmsArchiveSites = async (expressApp: Express) => {
    const archiveClient = new CmsArchiveDbClient();
    const htmlRenderer = await initAndGetRenderer(expressApp);

    new CmsArchiveSite({
        config: {
            name: 'Selvbetjeningssonen CMS',
            basePath: '/sbs',
            indexPrefix: 'cmssbs',
        },
        expressApp,
        dbClient: archiveClient,
        htmlRenderer,
    });

    new CmsArchiveSite({
        config: {
            name: 'Fagsystemsonen CMS',
            basePath: '/fss',
            indexPrefix: 'cmsfss',
        },
        expressApp,
        dbClient: archiveClient,
        htmlRenderer,
    });

    expressApp.get('/', (req, res) => {
        return res.redirect('/sbs');
    });
};
