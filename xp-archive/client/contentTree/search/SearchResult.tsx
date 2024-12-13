import React from 'react';
import { Loader } from '@navikt/ds-react';

type SearchResultProps = {
    isLoading: boolean;
};

export const SearchResult = ({ isLoading }: SearchResultProps) => {
    return <div>{isLoading ? <Loader /> : <div>Search results will go here</div>}</div>;
};
