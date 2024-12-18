import React from 'react';
import { Button, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { SearchResultItem } from './SearchResultItem/SearchResultItem';

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
