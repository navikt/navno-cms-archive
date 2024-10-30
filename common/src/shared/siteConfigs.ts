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
        name: 'nav.no (selvbetjeningssonen)',
        basePath: '/sbs',
        indexPrefix: 'cmssbs',
        type: 'enonic-legacy',
    },
    {
        name: 'Navet (fagsystemsonen)',
        basePath: '/fss',
        indexPrefix: 'cmsfss',
        type: 'enonic-legacy',
    },
] as const;

export const xpArchiveConfig: XpArchiveSiteConfig = {
    name: 'nav.no (Enonic XP)',
    basePath: '/xp',
    type: 'enonic-xp',
} as const;

export const siteConfigs: SiteConfig[] = [...legacyArchiveConfigs, xpArchiveConfig] as const;
