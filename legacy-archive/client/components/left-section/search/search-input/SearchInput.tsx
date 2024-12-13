import React, { useRef } from 'react';
import { Search } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';
import { SearchSettings } from './search-settings/SearchSettings';
import { useSearchState } from '../../../../context/search-state/useSearchState';

import style from './SearchInput.module.css';

type Props = {
    className?: string;
};

export const SearchInput = ({ className }: Props) => {
    const { searchParams, updateSearchParams, runSearch } = useSearchState();

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

                    runSearch(searchParams);
                }}
            >
                <Search
                    label={'Søk'}
                    hideLabel={true}
                    size={'small'}
                    ref={inputRef}
                    value={searchParams.query || ''}
                    onChange={(value) => updateSearchParams({ query: value })}
                />
            </form>
        </div>
    );
};
