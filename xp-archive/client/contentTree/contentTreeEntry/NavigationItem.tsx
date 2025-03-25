import React from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppState } from '../../context/appState/useAppState';
import { TreeItem } from '@mui/x-tree-view';
import { useContentTree } from 'client/hooks/useContentTree';
import style from './NavigationItem.module.css';

type Props = {
    entry: ContentTreeEntryData;
};

export const getContentIconUrl = (type: string) =>
    `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentIcon?type=${type}`;

export const NavigationItem = ({ entry }: Props) => {
    const { updateSelectedContent } = useAppState();

    const label = (
        <span style={{ display: 'flex', alignItems: 'center' }}>
            <img
                src={getContentIconUrl(entry.type)}
                width={20}
                height={20}
                style={{ marginRight: '5px' }}
                alt={''}
            />
            {entry.displayName}
        </span>
    );

    const entryLocalized = entry.isLocalized || entry.hasLocalizedDescendants;

    const onClick = () => {
        if (!entry.isEmpty) {
            updateSelectedContent({
                contentId: entry.id,
                versionId: entry.versionId,
                locale: entry.locale,
            });
        }
    };

    return (
        <TreeItem
            className={entryLocalized ? '' : style.foggy}
            itemId={entry.id}
            label={label}
            onClick={onClick}
        >
            {entry.numChildren > 0 ? (
                <NavigationItems path={entry.path} locale={entry.locale} />
            ) : null}
        </TreeItem>
    );
};

const NavigationItems = ({ path, locale }: { path: string; locale: string }) => {
    const { data, isLoading } = useContentTree(path, locale);
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
