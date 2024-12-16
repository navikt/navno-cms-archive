import React from 'react';
import { Button, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { useAppState } from 'client/context/appState/useAppState';
import { classNames } from '../../../../common/src/client/utils/classNames';

import style from './SearchResult.module.css';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    closeSearchResult: () => void;
};

export const SearchResult = ({ isLoading, searchResult, closeSearchResult }: SearchResultProps) => {
    const { setSelectedContentId, selectedContentId } = useAppState();
    const { hits, total } = searchResult;

    return (
        <div>
            {isLoading ? (
                <Loader size={'3xlarge'} />
            ) : (
                <div className={style.wrapper}>
                    <div>
                        {`Treff for "${searchResult.query}" (${total})`}{' '}
                        <Button variant="tertiary" size="small" onClick={closeSearchResult}>
                            Lukk
                        </Button>
                    </div>
                    {hits.map((hit, index) => (
                        <div
                            className={classNames(
                                style.hit,
                                selectedContentId === hit._id && style.hitSelected
                            )}
                            key={index}
                            onClick={() => setSelectedContentId(hit._id)}
                        >
                            <img
                                src={`${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentIcon?type=${hit.type}`}
                                width={20}
                                height={20}
                                style={{ marginRight: '5px' }}
                                alt={''}
                            />
                            {hit.displayName}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
