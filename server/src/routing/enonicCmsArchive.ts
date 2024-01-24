import { Express } from 'express';
import { CmsArchiveSite } from '../enonic-cms/CmsArchiveSite';
import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';

export const setupEnonicCmsArchiveSites = (expressApp: Express) => {
    const archiveClient = new CmsArchiveDbClient()

    new CmsArchiveSite({
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
        expressApp,
        dbClient: archiveClient
    });

    new CmsArchiveSite({
        basePath: '/fss',
        indexPrefix: 'cmsfss',
        expressApp,
        dbClient: archiveClient
    });
};