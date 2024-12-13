import React from 'react';
import { Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    query: string;
};

export const SearchResult = ({ isLoading, searchResult, query }: SearchResultProps) => {
    const { hits, total } = searchResult;

    return (
        <div>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <div>{`Treff for "${query}" (${total}):`}</div>
                    {hits.map((hit) => (
                        <div key={hit._id}>{hit.displayName}</div>
                    ))}
                </>
            )}
        </div>
    );
};
