import React, { useEffect, useState } from 'react';
import { initialSearchParams, SearchState, SearchStateContext } from './SearchStateContext';
import { ContentSearchParams } from '../../../common/contentSearch';
import { getInitialSearchParams, persistSearchParams } from './search-settings-cookies';
import { useAppState } from '../app-state/useAppState';

export const SearchStateProvider = ({ children }: { children: React.ReactNode }) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    const [searchResult, setSearchResult] = useState<SearchState['searchResult']>(null);
    const [searchParams, setSearchParams] = useState<SearchState['searchParams']>(
        getInitialSearchParams(basePath)
    );
    const [searchResultIsOpen, setSearchResultIsOpen] = useState(false);

    const updateSearchParams = (params: Partial<ContentSearchParams>) => {
        const newParams: ContentSearchParams = { ...searchParams, ...params, isCustom: true };
        persistSearchParams(newParams, basePath);
        setSearchParams(newParams);
    };

    const resetSearchParams = () => setSearchParams(initialSearchParams);

    useEffect(() => {
        setSearchResultIsOpen(!!searchResult);
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
                resetSearchParams,
            }}
        >
            {children}
        </SearchStateContext.Provider>
    );
};
