import React from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppState } from '../../context/appState/useAppState';
import { TreeItem } from '@mui/x-tree-view';
import { useContentTree } from 'client/hooks/useContentTree';

type Props = {
    entry: ContentTreeEntryData;
};

export const NavigationItem = ({ entry }: Props) => {
    const { setSelectedContentId } = useAppState();

    const iconUrl = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentIcon?type=${entry.type}`;
    const label = (
        <span style={{ display: 'flex', alignItems: 'center' }}>
            <img src={iconUrl} width={20} height={20} style={{ marginRight: '5px' }} alt={''} />
            {entry.displayName}
        </span>
    );

    return (
        <TreeItem
            itemId={entry.id}
            label={label}
            onClick={() => {
                setSelectedContentId(entry.id);
            }}
        >
            {entry.numChildren > 0 ? <NavigationItems path={entry.path} /> : null}
        </TreeItem>
    );
};

const NavigationItems = ({ path }: { path: string }) => {
    const { data, isLoading } = useContentTree(path);
    return (
        <>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                data?.children.map((entry) => <NavigationItem entry={entry} key={entry.id} />)
            )}
        </>
    );
};
