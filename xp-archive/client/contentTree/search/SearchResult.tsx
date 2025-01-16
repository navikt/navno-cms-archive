import React from 'react';
import { XMarkIcon } from '@navikt/aksel-icons';
import { Button, Detail, Heading, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { SearchResultItem } from './SearchResultItem/SearchResultItem';

import style from './SearchResult.module.css';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    closeSearchResult: () => void;
};

export const SearchResult = ({ isLoading, searchResult, closeSearchResult }: SearchResultProps) => {
    const { hits, query, total, hasMore } = searchResult;

    const orderedHits = [...hits].sort((a, b) => {
        const orderedTypes = [
            'no.nav.navno:content-page-with-sidemenus',
            'no.nav.navno:situation-page',
            'no.nav.navno:themed-article-page',
            'no.nav.navno:guide-page',
            'no.nav.navno:current-topic-page',
            'no.nav.navno:main-article',
            'no.nav.navno:internal-link',
            'no.nav.navno:external-link',
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
                    <Button
                        className={style.closeButton}
                        variant="primary-neutral"
                        icon={<XMarkIcon />}
                        onClick={closeSearchResult}
                    >
                        Lukk søkeresultat
                    </Button>
                </>
            )}
        </div>
    );
};
