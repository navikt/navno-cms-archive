import React from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppState } from '../../context/AppState';

type Props = {
    entry: ContentTreeEntryData;
};

export const NavigationItem = ({ entry }: Props) => {
    const { setContentId } = useAppState();

    return (
        <div
            onClick={() => {
                setContentId(entry.id);
            }}
        >{`${entry.name} [${entry.id}]`}</div>
    );
};
