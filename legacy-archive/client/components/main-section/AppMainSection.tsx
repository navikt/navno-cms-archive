import React, { useEffect } from 'react';
import { ContentView } from './content-view/ContentView';
import { useAppState } from '../../context/app-state/useAppState';
import { useApiFetch } from '../../fetch/useApiFetch';
import { EmptyState } from '@common/shared/EmptyState/EmptyState';

import style from './AppMainSection.module.css';

export const AppMainSection = () => {
    const { selectedContent, setSelectedContent, appContext } = useAppState();
    const { fetchContentVersion } = useApiFetch();

    const { selectedVersionKey } = appContext;

    useEffect(() => {
        if (!selectedVersionKey || selectedContent) {
            return;
        }

        fetchContentVersion(selectedVersionKey).then((res) => {
            if (res) {
                setSelectedContent(res);
            }
        });
    }, [fetchContentVersion, selectedContent, selectedVersionKey, setSelectedContent]);

    return (
        <div className={style.mainContent}>
            {selectedContent ? <ContentView content={selectedContent} /> : <EmptyState />}
        </div>
    );
};
