import React, { createContext, useContext, useState } from 'react';
import { appErrorContext } from '../../common/appContext';
import { ContentSearchParams, ContentSearchResult } from '../../common/contentSearch';

type SearchState = {
    searchResult: ContentSearchResult | null;
    searchParams: ContentSearchParams;
};

export const initialSearchParams: ContentSearchParams = {
    from: 0,
    size: 50,
    withChildCategories: true,
} as const;

const SearchStateContext = createContext<SearchState>({
    searchResult: null,
    searchParams: initialSearchParams,
});

export const useSearchState = () => {
    const { searchParams, searchResult } = useContext(SearchStateContext);

    return {
        searchParams,
        searchResult,
    };
};

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [result, setResult] = useState();
};
