import React from 'react';
import { Button, Heading, Loader } from '@navikt/ds-react';
import { SearchResponse } from 'shared/types';
import { SearchResultItem } from './SearchResultItem/SearchResultItem';

import style from './SearchResult.module.css';

type SearchResultProps = {
    isLoading: boolean;
    searchResult: SearchResponse;
    closeSearchResult: () => void;
};

export const SearchResult = ({ isLoading, searchResult, closeSearchResult }: SearchResultProps) => {
    const { hits, query, total } = searchResult; //TODO legg til hasMore

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
                                    {`Treff for "${query}": (${total})`}
                                </Heading>
                            </div>
                        </div>
                        <Button variant="tertiary" size="small" onClick={closeSearchResult}>
                            Lukk
                        </Button>
                    </div>
                    {hits.map((hit) => (
                        <SearchResultItem hit={hit} key={hit._id + hit.layerLocale} />
                    ))}
                </div>
            )}
        </div>
    );
};
