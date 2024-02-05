import React, { useEffect, useState } from 'react';
import { emptySearchResult, initialSearchParams, SearchStateContext } from './SearchStateContext';
import { ContentSearchParams, ContentSearchResult } from '../../../common/contentSearch';
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

    const updateSearchParams = (params: Partial<ContentSearchParams>) => {
        const newParams: ContentSearchParams = { ...searchParams, ...params, isCustom: true };
        persistSearchParams(newParams, basePath);
        setSearchParams(newParams);
    };

    const resetSearchSettings = () =>
        setSearchParams({ ...initialSearchParams, query: searchParams.query });

    const runSearch = (params: ContentSearchParams) =>
        fetchSearch(params).then((result) => {
            setSearchResult(
                result || {
                    total: 0,
                    hits: [],
                    status: 'error',
                    params: params,
                }
            );
        });

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
                updateSearchParams,
                resetSearchSettings,
                runSearch,
            }}
        >
            {children}
        </SearchStateContext.Provider>
    );
};
