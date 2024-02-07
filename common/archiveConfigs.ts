import { CmsArchiveSiteConfig } from 'navno-cms-archive-server/src/cms/CmsArchiveSite';

export const archiveConfigs: CmsArchiveSiteConfig[] = [
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
