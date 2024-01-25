import { Express } from 'express';
import { CmsArchiveSite } from '../enonic-cms/CmsArchiveSite';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import { initAndGetRenderer } from '../site/ssr/initRenderer';

export const setupCmsArchiveSites = async (expressApp: Express) => {
    const archiveClient = new CmsArchiveDbClient();
    const htmlRenderer = await initAndGetRenderer(expressApp);

    new CmsArchiveSite({
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
        expressApp,
        dbClient: archiveClient,
        htmlRenderer,
    });

    new CmsArchiveSite({
        basePath: '/fss',
        indexPrefix: 'cmsfss',
        expressApp,
        dbClient: archiveClient,
        htmlRenderer,
    });
};
