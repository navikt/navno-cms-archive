import React from 'react';
import { VersionReference } from '../../shared/types';
import { useAppState } from '../context/appState/useAppState';
import { NavigationBar } from '../contentTree/NavigationBar';
import { VersionSelector } from '../versionSelector/VersionSelector';

import style from './SideView.module.css';

export const SideView = ({ versions }: { versions: VersionReference[] }) => {
    const { versionViewOpen, setVersionViewOpen } = useAppState();

    return (
        <div className={style.wrapper}>
            {versionViewOpen ? (
                <VersionSelector versions={versions} onClose={() => setVersionViewOpen(false)} />
            ) : (
                <NavigationBar />
            )}
        </div>
    );
};
