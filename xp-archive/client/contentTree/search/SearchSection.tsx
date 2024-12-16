// SearchSection.tsx
import React, { useState } from 'react';
import { Heading, Search } from '@navikt/ds-react';
import { fetchJson } from '@common/shared/fetchUtils';
import { SearchResponse } from 'shared/types';
import { SearchResult } from './SearchResult';

export const useSearch = () => {
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

    return {
        searchResultIsOpen,
        searchQuery,
        setSearchQuery,
        isLoading,
        searchResult,
        searchData,
        closeSearchResult,
    };
};

export const SearchSection = () => {
    const {
        searchResultIsOpen,
        searchQuery,
        setSearchQuery,
        isLoading,
        searchResult,
        searchData,
        closeSearchResult,
    } = useSearch();

    return (
        <>
            <Heading size={'small'}>{'Søk'}</Heading>
            <form
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
            {searchResultIsOpen && (
                <SearchResult
                    isLoading={isLoading}
                    searchResult={searchResult}
                    closeSearchResult={closeSearchResult}
                />
            )}
        </>
    );
};
