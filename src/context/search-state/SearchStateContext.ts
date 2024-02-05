import { createContext } from 'react';
import { ContentSearchParams, ContentSearchResult } from '../../../common/contentSearch';

export type SearchState = {
    searchResult: ContentSearchResult;
    setSearchResult: (result: ContentSearchResult) => void;
    searchResultIsOpen: boolean;
    setSearchResultIsOpen: (isOpen: boolean) => void;
    searchParams: ContentSearchParams;
    setSearchParams: (params: ContentSearchParams) => void;
    updateSearchParams: (params: Partial<ContentSearchParams>) => void;
    resetSearchSettings: () => void;
    runSearch: (params: ContentSearchParams) => void;
};

export const initialSearchParams: ContentSearchParams = {
    from: 0,
    size: 25,
    withChildCategories: true,
} as const;

export const emptySearchResult: ContentSearchResult = {
    total: 0,
    hits: [],
    status: 'empty',
    params: initialSearchParams,
} as const;

export const SearchStateContext = createContext<SearchState>({
    searchResult: emptySearchResult,
    setSearchResult: () => ({}),
    searchResultIsOpen: false,
    setSearchResultIsOpen: () => ({}),
    searchParams: initialSearchParams,
    setSearchParams: () => ({}),
    updateSearchParams: () => ({}),
    resetSearchSettings: () => ({}),
    runSearch: () => ({}),
});
