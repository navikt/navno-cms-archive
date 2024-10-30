import React from 'react';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import { useContentTree } from '../hooks/useContentTree';
import { NavigationItem } from './contentTreeEntry/NavigationItem';
import { SimpleTreeView } from '@mui/x-tree-view';

export const NavigationBar = () => {
    const { data, isLoading } = useContentTree('/', 'no');

    return (
        <div>
            <Heading size={'small'}>{'Innhold'}</Heading>
            {isLoading ? (
                <Loader />
            ) : (
                <SimpleTreeView>
                    {data?.children.map((entry) => <NavigationItem entry={entry} key={entry.id} />)}
                </SimpleTreeView>
            )}
            <Alert variant={'warning'} size={'small'} inline={true} style={{ marginTop: '1.5rem' }}>
                {'Obs: dette arkivet er under utvikling og er ikke klart til bruk!'}
            </Alert>
        </div>
    );
};
