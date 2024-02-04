import React, { useRef, useState } from 'react';
import { Search } from '@navikt/ds-react';
import { ContentSearchParams, ContentSearchResult } from '../../../../common/contentSearch';
import { useApiFetch } from '../../../fetch/useApiFetch';
import { classNames } from '../../../utils/classNames';
import { SearchSettings } from './search-settings/SearchSettings';

import style from './SearchInput.module.css';

type Props = {
    setSearchResult: (searchResult: ContentSearchResult | null) => void;
    className?: string;
};

export const SearchInput = ({ setSearchResult, className }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchParams, setSearchParams] = useState<ContentSearchParams>({
        from: 0,
        size: 50,
        sort: 'score',
        type: 'titles',
        withChildCategories: true,
    });

    const setSearchParamsPartial = (params: Partial<ContentSearchParams>) => {
        setSearchParams({ ...searchParams, ...params });
    };

    const { fetchSearch } = useApiFetch();

    return (
        <div className={classNames(style.search, className)}>
            <SearchSettings searchParams={searchParams} setSearchParams={setSearchParamsPartial} />
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
                    onChange={(value) => setSearchParamsPartial({ query: value })}
                />
            </form>
        </div>
    );
};
