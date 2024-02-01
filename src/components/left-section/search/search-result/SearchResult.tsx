import React from 'react';
import { classNames } from '../../../../utils/classNames';
import { ContentSearchResult } from '../../../../../common/contentSearchResult';
import { Button, Heading } from '@navikt/ds-react';
import { SearchResultHit } from './search-hit/SearchResultHit';

import style from './SearchResult.module.css';

type Props = {
    result: ContentSearchResult | null;
    close: () => void;
};

export const SearchResult = ({ result, close }: Props) => {
    return (
        <div className={classNames(style.result)}>
            {result && (
                <div className={style.header}>
                    <Heading
                        size={'small'}
                        level={'2'}
                    >{`Treff for "${result.query}" (${result.total})`}</Heading>
                    <Button size={'xsmall'} variant={'tertiary'} onClick={close}>
                        {'Lukk'}
                    </Button>
                </div>
            )}

            {result?.hits.map((hit) => <SearchResultHit hit={hit} key={hit.versionKey} />)}
        </div>
    );
};
