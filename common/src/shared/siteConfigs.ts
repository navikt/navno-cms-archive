type BaseConfig = {
    name: string;
    baseUrl: string;
};

export type CmsArchiveSiteConfig = {
    indexPrefix: string;
    type: 'enonic-legacy';
} & BaseConfig;

export type XpArchiveSiteConfig = {
    type: 'enonic-xp';
} & BaseConfig;

export type SiteConfig = CmsArchiveSiteConfig | XpArchiveSiteConfig;

export const cmsArchiveConfigs: CmsArchiveSiteConfig[] = [
    {
        name: 'nav.no (selvbetjeningssonen)',
        baseUrl: '/sbs',
        indexPrefix: 'cmssbs',
        type: 'enonic-legacy',
    },
    {
        name: 'Navet (fagsystemsonen)',
        baseUrl: '/fss',
        indexPrefix: 'cmsfss',
        type: 'enonic-legacy',
    },
] as const;

export const siteConfigs: SiteConfig[] = [
    ...cmsArchiveConfigs,
    {
        name: 'nav.no (2024)',
        baseUrl: 'http://localhost:3499/xp',
        type: 'enonic-xp',
    },
] as const;
