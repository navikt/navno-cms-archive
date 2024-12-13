import React from 'react';
import { Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { useAppState } from 'client/context/appState/useAppState';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    query: string;
};

export const SearchResult = ({ isLoading, searchResult, query }: SearchResultProps) => {
    const { setSelectedContentId, selectedContentId } = useAppState();
    const { hits, total } = searchResult;

    return (
        <div>
            {isLoading ? (
                <Loader size={'3xlarge'} />
            ) : (
                <>
                    <div>{`Treff for "${query}" (${total}):`}</div>
                    {hits.map((hit) => (
                        <div
                            key={hit._id}
                            onClick={() => setSelectedContentId(hit._id)}
                            style={{
                                cursor: 'pointer',
                                padding: '4px',
                                margin: '4px 0',
                                backgroundColor:
                                    selectedContentId === hit._id
                                        ? 'var(--a-surface-selected)'
                                        : 'var(--a-surface-subtle)',
                                borderRadius: '4px',
                            }}
                        >
                            {hit.displayName}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};
