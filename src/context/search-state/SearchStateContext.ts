import { createContext } from 'react';
import { ContentSearchParams, ContentSearchResult } from '../../../common/contentSearch';

export type SearchState = {
    searchResult: ContentSearchResult | null;
    setSearchResult: (result: ContentSearchResult | null) => void;
    searchResultIsOpen: boolean;
    setSearchResultIsOpen: (isOpen: boolean) => void;
    searchParams: ContentSearchParams;
    setSearchParams: (params: ContentSearchParams) => void;
    updateSearchParams: (params: Partial<ContentSearchParams>) => void;
    resetSearchParams: () => void;
};

export const initialSearchParams: ContentSearchParams = {
    from: 0,
    size: 25,
    withChildCategories: true,
} as const;

export const SearchStateContext = createContext<SearchState>({
    searchResult: null,
    setSearchResult: () => ({}),
    searchResultIsOpen: false,
    setSearchResultIsOpen: () => ({}),
    searchParams: initialSearchParams,
    setSearchParams: () => ({}),
    updateSearchParams: () => ({}),
    resetSearchParams: () => ({}),
});
