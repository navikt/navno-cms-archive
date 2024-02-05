import React from 'react';
import { classNames } from '../../../../utils/classNames';
import { Button, Heading } from '@navikt/ds-react';
import { SearchResultHit } from './search-hit/SearchResultHit';
import { ContentLoader } from '../../../common/loader/ContentLoader';
import { useSearchState } from '../../../../context/search-state/useSearchState';

import style from './SearchResult.module.css';

export const SearchResult = () => {
    const { searchResult, setSearchResult } = useSearchState();

    return (
        <div className={classNames(style.result)}>
            {searchResult?.status === 'loading' && (
                <ContentLoader size={'3xlarge'} text={'Laster søketreff...'} />
            )}
            {searchResult && searchResult.status !== 'loading' && (
                <div className={style.header}>
                    <Heading
                        size={'small'}
                        level={'2'}
                    >{`Treff for "${searchResult.params.query}" (${searchResult.total})`}</Heading>
                    <Button
                        size={'xsmall'}
                        variant={'tertiary'}
                        onClick={() => setSearchResult(null)}
                    >
                        {'Lukk'}
                    </Button>
                </div>
            )}
            {searchResult?.hits.map((hit) => <SearchResultHit hit={hit} key={hit.versionKey} />)}
        </div>
    );
};
