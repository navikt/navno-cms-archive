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
    const { hits } = searchResult;

    const filteredHits = hits.filter(
        (hit) =>
            hit.type === 'no.nav.navno:content-page-with-sidemenus' ||
            hit.type === 'no.nav.navno:themed-article-page' ||
            hit.type === 'no.nav.navno:situation-page' ||
            hit.type === 'no.nav.navno:guide-page'
    );

    const otherHits = hits.filter((hit) => !filteredHits.includes(hit));

    return (
        <div>
            {isLoading ? (
                <Loader size={'3xlarge'} />
            ) : (
                <div className={style.wrapper}>
                    <div>
                        {`Treff i innholdssider: (${filteredHits.length})`}{' '}
                        <Button variant="tertiary" size="small" onClick={closeSearchResult}>
                            Lukk
                        </Button>
                    </div>
                    {filteredHits.map((hit, index) => (
                        <SearchResultItem hit={hit} key={index} />
                    ))}
                    {`Treff i filer og annet: (${otherHits.length})`}{' '}
                    {otherHits.map((hit, index) => (
                        <SearchResultItem hit={hit} key={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

const SearchResultItem = ({ hit, key }: { hit: SearchResponse['hits'][number]; key: number }) => {
    const { setSelectedContentId, selectedContentId, setSelectedLocale, selectedLocale } =
        useAppState();

    return (
        <button
            className={classNames(
                style.hit,
                hit._id === selectedContentId &&
                    hit.layerLocale === selectedLocale &&
                    style.hitSelected
            )}
            key={key}
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
    );
};
