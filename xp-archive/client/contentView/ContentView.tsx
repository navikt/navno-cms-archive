import React from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';

export const ContentView = () => {
    const { selectedContentId } = useAppState();

    const { data, isLoading } = useFetchContent(selectedContentId || '');

    return (
        <div>
            <Heading size={'medium'}>{'Content!'}</Heading>
            {isLoading ? <Loader /> : JSON.stringify(data)}
        </div>
    );
};
