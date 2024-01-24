import { Express } from 'express';
import { EnonicCmsArchiveSite } from '../enonic-cms/EnonicCmsArchiveSite';

export const setupEnonicCmsArchiveSites = (expressApp: Express) => {
    new EnonicCmsArchiveSite({
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
        expressApp,
    });

    new EnonicCmsArchiveSite({
        basePath: '/fss',
        indexPrefix: 'cmsfss',
        expressApp,
    });
};