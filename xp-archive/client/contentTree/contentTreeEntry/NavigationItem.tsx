import React, { useState } from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppState } from '../../context/appState/useAppState';
import { TreeItem } from '@mui/x-tree-view';
import { FolderIcon } from '@navikt/aksel-icons';
import { useContentTree } from 'client/hooks/useContentTree';


type Props = {
    entry: ContentTreeEntryData;
};

export const NavigationItem = ({ entry }: Props) => {
    const { setSelectedContentId } = useAppState();

    const label = <span style={{ display: 'flex', alignItems: 'center' }}><FolderIcon style={{ marginRight: '5px' }} />{entry.displayName} </span>

    return (
        <TreeItem itemId={entry.id} label={label}
            onClick={() => {
                setSelectedContentId(entry.id);
            }}
        >
            {entry.hasChildren ? <NavigationItems path={entry.path} /> : null}
        </TreeItem>
    );
};

const NavigationItems = ({ path }: { path: string }) => {
    const { data, isLoading } = useContentTree(path);
    return (
        <>
            {isLoading ? <div>Loading...</div> :
                data?.children.map(c => <NavigationItem entry={c} />)}
        </>
    );
}

