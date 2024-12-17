import React from 'react';
import { BodyShort, Button, Detail, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { useAppState } from 'client/context/appState/useAppState';
import { getContentIconUrl, updateContentUrl } from '../contentTreeEntry/NavigationItem';
import { classNames } from '../../../../common/src/client/utils/classNames';

import style from './SearchResult.module.css';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    closeSearchResult: () => void;
};

export const SearchResult = ({ isLoading, searchResult, closeSearchResult }: SearchResultProps) => {
    const { setSelectedContentId, selectedContentId, setSelectedLocale, selectedLocale } =
        useAppState();
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
                        <button
                            className={classNames(
                                style.hit,
                                hit._id === selectedContentId &&
                                    hit.layerLocale === selectedLocale &&
                                    style.hitSelected
                            )}
                            key={index}
                            onClick={() => {
                                setSelectedContentId(hit._id);
                                setSelectedLocale(hit.layerLocale);
                                updateContentUrl(hit._id, hit.layerLocale);
                            }}
                        >
                            <img
                                src={getContentIconUrl(hit.type)}
                                width={32}
                                height={32}
                                style={{ marginRight: '5px' }}
                                alt={''}
                            />
                            <div className={style.hitTextWrapper}>
                                <BodyShort className={style.hitText}>{hit.displayName}</BodyShort>
                                <Detail className={style.hitText}>{hit._path}</Detail>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
