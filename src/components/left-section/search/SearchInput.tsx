import React, { useRef, useState } from 'react';
import { Button, Label, Search } from '@navikt/ds-react';
import { ContentSearchResult } from '../../../../common/contentSearch';
import { useApiFetch } from '../../../fetch/useApiFetch';
import { classNames } from '../../../utils/classNames';
import { ChevronDownIcon } from '@navikt/aksel-icons';

import style from './SearchInput.module.css';

type Props = {
    setSearchResult: (searchResult: ContentSearchResult | null) => void;
    className?: string;
};

export const SearchInput = ({ setSearchResult, className }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

    const { fetchSearch } = useApiFetch();

    return (
        <div className={classNames(style.search, className)}>
            <div className={style.labels}>
                <Label size={'small'}>{'Søk'}</Label>
                <Button
                    size={'xsmall'}
                    variant={'tertiary'}
                    onClick={() => setAdvancedSearchOpen(true)}
                >
                    {'Tilpass søket (coming soon!)'}
                    <ChevronDownIcon />
                </Button>
            </div>
            <form
                role={'search'}
                onSubmit={(e) => {
                    e.preventDefault();

                    const queryInput = inputRef.current?.value;
                    if (!queryInput) {
                        setSearchResult(null);
                        return;
                    }

                    setSearchResult({
                        hits: [],
                        params: { query: queryInput, from: 0, size: 0 },
                        total: 0,
                        status: 'loading',
                    });

                    fetchSearch({ query: queryInput, from: 0, size: 50 }).then((result) => {
                        setSearchResult(result);
                    });
                }}
            >
                <Search
                    label={'Søk'}
                    hideLabel={true}
                    size={'small'}
                    ref={inputRef}
                    onClear={() => setSearchResult(null)}
                />
            </form>
        </div>
    );
};
