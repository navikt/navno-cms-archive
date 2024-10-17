import React from 'react';
import { Heading, Loader } from '@navikt/ds-react';
import { useContentTree } from '../hooks/useContentTree';
import { NavigationItem } from './contentTreeEntry/NavigationItem';

export const NavigationBar = () => {
    const { data, isLoading } = useContentTree('/');

    return (
        <div>
            <Heading size={'small'}>{'Innhold'}</Heading>
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    {data?.children.map((entry) => <NavigationItem entry={entry} key={entry.id} />)}
                </div>
            )}
        </div>
    );
};
