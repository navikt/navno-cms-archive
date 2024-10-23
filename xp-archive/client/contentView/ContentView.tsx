import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { Content } from 'shared/types';

import style from './ContentView.module.css';

export const ContentView = () => {
    const { selectedContentId } = useAppState();

    const { data, isLoading } = useFetchContent(selectedContentId || '');

    return (
        <div>
            <Heading size={'medium'}>{'Content!'}</Heading>

            <div className={style.view}>
                {isLoading ? <Loader /> : data ? jsonPrettyPrint(data) : 'Ingen JSON'}
            </div>
        </div>
    );
};

const jsonPrettyPrint = (data: Content) => JSON.stringify(data, null, 2);
