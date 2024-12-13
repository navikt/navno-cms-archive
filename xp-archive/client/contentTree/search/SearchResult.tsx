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
                    {hits.map((hit, index) => (
                        <>
                            <img
                                src={`${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentIcon?type=${hit.type}`}
                                width={20}
                                height={20}
                                style={{ marginRight: '5px' }}
                                alt={''}
                            />
                            <div
                                key={index}
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
                                --
                                {hit.type}
                            </div>
                        </>
                    ))}
                </>
            )}
        </div>
    );
};
