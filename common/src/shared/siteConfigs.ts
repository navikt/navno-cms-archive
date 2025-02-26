type BaseConfig = {
    name: string;
    basePath: string;
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
        name: 'nav.no (før 2019)',
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
        type: 'enonic-legacy',
    },
    {
        name: 'Intranett (før 2019)',
        basePath: '/fss',
        indexPrefix: 'cmsfss',
        type: 'enonic-legacy',
    },
] as const;

export const xpArchiveConfig: XpArchiveSiteConfig = {
    name: 'nav.no (etter 2019)',
    basePath: '/xp',
    type: 'enonic-xp',
} as const;

export const siteConfigs: SiteConfig[] = [xpArchiveConfig, ...legacyArchiveConfigs] as const;
