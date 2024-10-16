import React, { useRef } from 'react';
import { classNames } from '../../../../utils/classNames';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { SearchResultHit } from './search-hit/SearchResultHit';
import { ContentLoader } from '../../../common/loader/ContentLoader';
import { useSearchState } from '../../../../context/search-state/useSearchState';
import { Paginator } from '../../../common/paginator/Paginator';

import style from './SearchResult.module.css';

export const SearchResult = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { searchResult, setSearchResultIsOpen, searchParams, runSearch } = useSearchState();

    const { hits, total, status, params } = searchResult;
    const { size, from } = params;

    const numPages = Math.ceil(total / size);
    const currentPage = Math.floor(from / size) + 1;

    const onPageChange = (page: number) => {
        runSearch({ ...searchParams, from: size * (page - 1) });
        ref.current?.scrollTo({ top: 0 });
    };

    return (
        <>
            <div className={classNames(style.result)} ref={ref}>
                {status === 'loading' ? (
                    <ContentLoader size={'3xlarge'} text={'Laster søketreff...'} />
                ) : status === 'error' ? (
                    <Alert variant={'error'}>
                        {
                            'Feil: søket kunne ikke utføres. Prøv igjen, eller kontakt brukerstøtte dersom problemet vedvarer.'
                        }
                    </Alert>
                ) : status === 'success' ? (
                    <>
                        <div className={style.header}>
                            <Heading
                                size={'small'}
                                level={'2'}
                            >{`Treff for "${params.query}" (${total}):`}</Heading>
                            <Button
                                size={'xsmall'}
                                variant={'tertiary'}
                                onClick={() => setSearchResultIsOpen(false)}
                            >
                                {'Lukk'}
                            </Button>
                        </div>
                        {hits.map((hit) => (
                            <SearchResultHit hit={hit} key={hit.versionKey} />
                        ))}
                    </>
                ) : null}
            </div>
            <Paginator numPages={numPages} pageNumber={currentPage} onPageChange={onPageChange} />
        </>
    );
};
