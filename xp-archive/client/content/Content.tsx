import React, { useState, useEffect } from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { VersionSelector } from 'client/versionSelector/VersionSelector';
import { ContentView } from '../contentView/ContentView';

import style from './Content.module.css';

const getDefaultView = (isWebpage: boolean, hasAttachment: boolean): ViewVariant | undefined => {
    if (isWebpage) return 'html';
    if (hasAttachment) return 'filepreview';
    return undefined;
};

export const Content = () => {
    const { selectedContentId, selectedLocale, selectedVersion } = useAppState();

    const fetchId = selectedVersion?.nodeId || selectedContentId;

    const { data, isLoading } = useFetchContent({
        id: fetchId || '',
        locale: selectedLocale,
        versionId: selectedVersion?.versionId ?? undefined,
    });

    const isWebpage = !!data?.html && !data.json.attachment;
    const hasAttachment = !!data?.json.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    return (
        <div className={style.content}>
            <div className={style.top}>
                <ViewSelector
                    selectedView={selectedView}
                    setSelectedView={setSelectedView}
                    hasAttachment={hasAttachment}
                    isWebpage={isWebpage}
                />
                <VersionSelector versions={data?.versions || []} />
            </div>
            <ContentView
                selectedView={selectedView || getDefaultView(isWebpage, hasAttachment) || 'html'}
                isLoading={isLoading}
                data={data}
            />
        </div>
    );
};
