import React from 'react';
import { Button, Heading, HelpText, Loader } from '@navikt/ds-react';
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
                    <div className={style.filteredHitsHeading}>
                        <div>
                            <div className={style.filteredHitsHeadingText}>
                                <Heading size="small" level="2">
                                    {`Treff i sidetyper: (${filteredHits.length})`}
                                </Heading>
                                <HelpText>
                                    Treff i sidetypene Produktside, Situasjonsside, Temaartikkel og
                                    Slik gjør du det.
                                </HelpText>
                            </div>
                        </div>
                        <Button variant="tertiary" size="small" onClick={closeSearchResult}>
                            Lukk
                        </Button>
                    </div>
                    {filteredHits.map((hit) => (
                        <SearchResultItem hit={hit} key={hit._id + hit.layerLocale} />
                    ))}
                    <Heading size="small" level="2" className={style.otherHitsHeading}>
                        {`Treff i filer og annet: (${otherHits.length})`}
                    </Heading>
                    {otherHits.map((hit) => (
                        <SearchResultItem hit={hit} key={hit._id + hit.layerLocale} />
                    ))}
                </div>
            )}
        </div>
    );
};
