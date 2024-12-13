import React from 'react';
import { Heading, Tabs, Search } from '@navikt/ds-react';
import { LayerPanel } from './layerPanel/LayerPanel';
import { useAppState } from 'client/context/appState/useAppState';
import { fetchJson } from '@common/shared/fetchUtils';
import { SearchResponse } from 'shared/types';

import style from './NavigationBar.module.css';

const locales = ['no', 'en', 'nn', 'se'] as const;
export type Locale = (typeof locales)[number];

const getLabel = (locale: Locale) => {
    const translations: Record<Locale, string> = {
        no: 'Norsk',
        en: 'Engelsk',
        nn: 'Nynorsk',
        se: 'Samisk',
    };
    return translations[locale];
};

export const NavigationBar = () => {
    const { setSelectedLocale } = useAppState();

    const SEARCH_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/search`;

    const searchData = async (query: string) => {
        return fetchJson<SearchResponse>(SEARCH_API, { params: { query } });
    };

    return (
        <div className={style.wrapper}>
            <Heading size={'small'} className={style.heading}>
                {'Innhold'}
            </Heading>
            <Search label="Søk" onSearchClick={searchData} />
            <Tabs defaultValue="no" onChange={(locale) => setSelectedLocale(locale as Locale)}>
                <Tabs.List>
                    {locales.map((locale) => (
                        <Tabs.Tab key={locale} value={locale} label={getLabel(locale)} />
                    ))}
                </Tabs.List>
                {locales.map((locale) => (
                    <Tabs.Panel key={locale} value={locale}>
                        <LayerPanel locale={locale} />
                    </Tabs.Panel>
                ))}
            </Tabs>
        </div>
    );
};
