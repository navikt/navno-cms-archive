import React from 'react';
import { ContentTreeEntryData } from '../../../shared/types';
import { useAppContext } from '../../context/AppState';

type Props = {
    entry: ContentTreeEntryData;
};

export const NavigationItem = ({ entry }: Props) => {
    const { setContentId } = useAppContext();

    return (
        <div
            onClick={() => {
                setContentId(entry.id);
            }}
        >{`${entry.name} [${entry.id}]`}</div>
    );
};
