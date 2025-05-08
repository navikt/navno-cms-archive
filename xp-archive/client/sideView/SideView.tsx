import React from 'react';
import { VersionReference } from '../../shared/types';
import { useAppState } from '../context/appState/useAppState';
import { NavigationBar } from '../contentTree/NavigationBar';
import { VersionSelector } from '../versionSelector/VersionSelector';

import style from './SideView.module.css';

export const SideView = ({ versions }: { versions: VersionReference[] }) => {
    const { versionViewOpen, setVersionViewOpen } = useAppState();

    return (
        <div className={`${style.wrapper} ${versionViewOpen ? style.versionView : ''}`}>
            {versionViewOpen ? (
                <VersionSelector versions={versions} onClose={() => setVersionViewOpen(false)} />
            ) : null}
            <div style={versionViewOpen ? { display: 'none' } : {}}>
                <NavigationBar />
            </div>
        </div>
    );
};
