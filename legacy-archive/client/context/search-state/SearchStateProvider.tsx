import React, { useEffect, useState } from 'react';
import { emptySearchResult, initialSearchParams, SearchStateContext } from './SearchStateContext';
import { ContentSearchParams, ContentSearchResult } from '../../../shared/contentSearch';
import { getInitialSearchParams, persistSearchParams } from './search-settings-cookies';
import { useAppState } from '../app-state/useAppState';
import { useApiFetch } from '../../fetch/useApiFetch';

type Props = {
    children: React.ReactNode;
};

export const SearchStateProvider = ({ children }: Props) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;
    const { fetchSearch } = useApiFetch();

    const [searchResult, setSearchResult] = useState<ContentSearchResult>(emptySearchResult);
    const [searchParams, setSearchParams] = useState<ContentSearchParams>(
        getInitialSearchParams(basePath)
    );
    const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);
    const [searchSettingsIsOpen, setSearchSettingsIsOpen] = useState(false);

    const updateSearchParams = (params: Partial<ContentSearchParams>) => {
        const newParams: ContentSearchParams = { ...searchParams, ...params, isCustom: true };
        persistSearchParams(newParams, basePath);
        setSearchParams(newParams);
    };

    const resetSearchSettings = () => {
        setSearchParams(initialSearchParams);
        persistSearchParams(initialSearchParams, basePath);
        setSearchResultIsOpen(false);
        setSearchSettingsIsOpen(false);
    };

    const runSearch = (params: ContentSearchParams) => {
        setSearchResult({
            hits: [],
            params,
            total: 0,
            status: 'loading',
        });

        fetchSearch(params)
            .then((result) => {
                setSearchResult(
                    result || {
                        total: 0,
                        hits: [],
                        status: 'error',
                        params: params,
                    }
                );
            })
            .catch(() => {});
    };

    useEffect(() => {
        setSearchResultIsOpen(searchResult.status !== 'empty');
    }, [searchResult]);

    return (
        <SearchStateContext.Provider
            value={{
                searchResult,
                setSearchResult,
                searchParams,
                setSearchParams,
                searchResultIsOpen,
                setSearchResultIsOpen,
                searchSettingsIsOpen,
                setSearchSettingsIsOpen,
                updateSearchParams,
                resetSearchSettings,
                runSearch,
            }}
        >
            {children}
        </SearchStateContext.Provider>
    );
};
