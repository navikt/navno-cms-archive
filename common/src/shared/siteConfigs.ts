type BaseConfig = {
    name: string;
    baseUrl: string;
};

export type LegacyArchiveSiteConfig = {
    indexPrefix: string;
    type: 'enonic-legacy';
} & BaseConfig;

export type XpArchiveSiteConfig = {
    type: 'enonic-xp';
} & BaseConfig;

export type SiteConfig = LegacyArchiveSiteConfig | XpArchiveSiteConfig;

export const legacyArchiveConfigs: LegacyArchiveSiteConfig[] = [
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

export const xpArchiveConfig: XpArchiveSiteConfig = {
    name: 'nav.no (2024)',
    baseUrl: '/xp',
    type: 'enonic-xp',
} as const;

export const siteConfigs: SiteConfig[] = [...legacyArchiveConfigs, xpArchiveConfig] as const;
