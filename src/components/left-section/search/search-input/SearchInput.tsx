import React, { useRef, useState } from 'react';
import { Search } from '@navikt/ds-react';
import { ContentSearchParams, ContentSearchResult } from '../../../../../common/contentSearch';
import { useApiFetch } from '../../../../fetch/useApiFetch';
import { classNames } from '../../../../utils/classNames';
import { SearchSettings } from './search-settings/SearchSettings';
import { getInitialSearchParams } from './params-initial-state';
import { useAppState } from '../../../../state/useAppState';

import style from './SearchInput.module.css';
import { initialSearchParams } from '../../../../state/useSearchState';

type Props = {
    setSearchResult: (searchResult: ContentSearchResult | null) => void;
    className?: string;
};

export const SearchInput = ({ setSearchResult, className }: Props) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    const inputRef = useRef<HTMLInputElement>(null);
    const [searchParams, setSearchParams] = useState<ContentSearchParams>(
        getInitialSearchParams(basePath)
    );

    const { fetchSearch } = useApiFetch();

    return (
        <div className={classNames(style.search, className)}>
            <SearchSettings
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                reset={() => setSearchParams({ ...initialSearchParams, query: searchParams.query })}
            />
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

                    fetchSearch(searchParams).then((result) => {
                        setSearchResult(result);
                    });
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
