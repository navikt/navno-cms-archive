import React, { useState } from 'react';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Tabs, Search, RadioGroup, Radio, Button } from '@navikt/ds-react';
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
    const [searchSettingsIsOpen, setSearchSettingsIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchType, setSearchType] = useState<'curated' | 'other'>('curated');
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
            params: {
                query: searchQuery,
                searchType,
            },
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
                    hideLabel={false}
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                />
            </form>
            <Button
                size={'xsmall'}
                variant={'tertiary'}
                className={style.toggleButton}
                icon={<ChevronDownIcon className={searchSettingsIsOpen ? style.chevronOpen : ''} />}
                onClick={() => setSearchSettingsIsOpen(!searchSettingsIsOpen)}
            >
                {'Tilpass søket'}
            </Button>
            {searchSettingsIsOpen && (
                <div className={style.radioGroupWrapper}>
                    <RadioGroup
                        legend="Treff i innholdstyper"
                        size="small"
                        onChange={setSearchType}
                        value={searchType}
                    >
                        <Radio
                            value="curated"
                            description="Produktside, Situasjonsside, Temaartikkel, Slik gjør du det, Aktuelt, Artikkel, Intern lenke, Ekstern lenke"
                        >
                            Utvalgte
                        </Radio>
                        <Radio value="other">Andre</Radio>
                    </RadioGroup>
                </div>
            )}
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
