import React from 'react';
import { Loader } from '@navikt/ds-react';
import { useContentTree } from 'client/hooks/useContentTree';
import { SimpleTreeView } from '@mui/x-tree-view';
import { NavigationItem } from '../contentTreeEntry/NavigationItem';
import { Locale } from '../NavigationBar';

export const LayerPanel = ({ locale }: { locale: Locale }) => {
    const { data, isLoading } = useContentTree('/', locale);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <SimpleTreeView>
                    {data?.children.map((entry) => <NavigationItem entry={entry} key={entry.id} />)}
                </SimpleTreeView>
            )}
        </>
    );
};
