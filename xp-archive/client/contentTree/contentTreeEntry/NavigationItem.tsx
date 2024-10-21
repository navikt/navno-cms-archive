import React from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppState } from '../../context/appState/useAppState';

type Props = {
    entry: ContentTreeEntryData;
};

export const NavigationItem = ({ entry }: Props) => {
    const { setSelectedContentId } = useAppState();

    return (
        <div
            onClick={() => {
                setSelectedContentId(entry.id);
            }}
        >{`${entry.name} [${entry.id}]`}</div>
    );
};
