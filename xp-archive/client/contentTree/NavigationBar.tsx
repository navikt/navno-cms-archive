import React, { useState } from 'react';
import { Tabs, Search } from '@navikt/ds-react';
import { LayerPanel } from './layerPanel/LayerPanel';
import { useAppState } from 'client/context/appState/useAppState';
import { fetchJson } from '@common/shared/fetchUtils';
import { SearchResponse } from 'shared/types';
import { SearchResult } from './search/SearchResult';

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
    const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchResponse>({
        hits: [],
        total: 0,
        hasMore: false,
        query: '',
    });

    const SEARCH_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/search`;

    const searchData = async () => {
        setIsLoading(true);
        const result = await fetchJson<SearchResponse>(SEARCH_API, {
            params: { query: searchQuery },
        });
        if (result) {
            setSearchResult(result);
        }
        setSearchResultIsOpen(true);
        setIsLoading(false);
        return result;
    };

    const closeSearchResult = () => {
        setSearchResultIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={style.wrapper}>
            <form
                className={style.search}
                role={'search'}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!searchQuery) {
                        return;
                    }

                    searchData();
                }}
            >
                <Search
                    label={'Søk'}
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                />
            </form>
            {searchResultIsOpen ? (
                <SearchResult
                    isLoading={isLoading}
                    searchResult={searchResult}
                    closeSearchResult={closeSearchResult}
                />
            ) : (
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
            )}
        </div>
    );
};
