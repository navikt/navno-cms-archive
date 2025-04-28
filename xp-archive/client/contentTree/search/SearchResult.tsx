import React from 'react';
import { Detail, Heading, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { SearchResultItem } from './SearchResultItem/SearchResultItem';

import style from './SearchResult.module.css';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
};

export const SearchResult = ({ isLoading, searchResult }: SearchResultProps) => {
    const { hits, query, total, hasMore } = searchResult;

    const orderedHits = [...hits].sort((a, b) => {
        const orderedTypes = [
            'no.nav.navno:content-page-with-sidemenus',
            'no.nav.navno:guide-page',
            'no.nav.navno:main-article',
            'no.nav.navno:internal-link',
            'no.nav.navno:external-link',
            'no.nav.navno:current-topic-page',
            'no.nav.navno:product-details',
            'no.nav.navno:global-case-time-set',
        ];

        const indexA = orderedTypes.indexOf(a.type);
        const indexB = orderedTypes.indexOf(b.type);

        return indexA - indexB;
    });

    return (
        <div className={style.wrapper}>
            {isLoading ? (
                <Loader size={'3xlarge'} />
            ) : (
                <>
                    <div className={style.heading}>
                        <div>
                            <div className={style.headingText}>
                                <Heading size="small" level="2">
                                    {`${total} treff på "${query}"`}
                                </Heading>
                            </div>
                        </div>
                    </div>
                    {orderedHits.map((hit) => (
                        <SearchResultItem hit={hit} key={hit._id + hit.layerLocale} />
                    ))}
                    {hasMore && (
                        <Detail>
                            Viser kun de første 1000 treffene. Prøv å avgrens søket om du ikke fant
                            det du lette etter.
                        </Detail>
                    )}
                </>
            )}
        </div>
    );
};
