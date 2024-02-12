import { CmsArchiveSiteConfig } from 'navno-cms-archive-server/src/cms/CmsArchiveSite';

export const archiveConfigs: CmsArchiveSiteConfig[] = [
    {
        name: 'nav.no (selvbetjeningssonen)',
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
    },
    {
        name: 'Navet (fagsystemsonen)',
        basePath: '/fss',
        indexPrefix: 'cmsfss',
    },
] as const;
