import React, { useRef } from 'react';
import { Search } from '@navikt/ds-react';
import { classNames } from '../../../../utils/classNames';
import { SearchSettings } from './search-settings/SearchSettings';
import { useSearchState } from '../../../../context/search-state/useSearchState';

import style from './SearchInput.module.css';

type Props = {
    className?: string;
};

export const SearchInput = ({ className }: Props) => {
    const { setSearchResult, searchParams, setSearchParams, runSearch } = useSearchState();

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={classNames(style.search, className)}>
            <SearchSettings />
            <form
                role={'search'}
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!searchParams.query) {
                        return;
                    }

                    setSearchResult({
                        hits: [],
                        params: searchParams,
                        total: 0,
                        status: 'loading',
                    });

                    runSearch(searchParams);
                }}
            >
                <Search
                    label={'Søk'}
                    hideLabel={true}
                    size={'small'}
                    ref={inputRef}
                    onChange={(value) => setSearchParams({ ...searchParams, query: value })}
                />
            </form>
        </div>
    );
};