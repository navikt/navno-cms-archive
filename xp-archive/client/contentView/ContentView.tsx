import React from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppContext } from '../context/AppState';

export const ContentView = () => {
    const { contentId } = useAppContext();

    const { data, isLoading } = useFetchContent(contentId || '');

    return (
        <div>
            <Heading size={'medium'}>{'Content!'}</Heading>
            {isLoading ? <Loader /> : JSON.stringify(data)}
        </div>
    );
};
