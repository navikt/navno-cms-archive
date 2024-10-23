import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { JsonView } from 'client/JsonView/JsonView';

export const ContentView = () => {
    const { selectedContentId } = useAppState();

    const { data, isLoading } = useFetchContent(selectedContentId || '');

    return (
        <div>
            <Heading size={'medium'}>{'Content!'}</Heading>
            {isLoading ? <Loader /> : <JsonView data={data} />}
        </div>
    );
};
