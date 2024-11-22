import React, { useState, useEffect } from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { Heading } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { VersionSelector } from 'client/versionSelector/VersionSelector';
import { ContentView } from '../contentView/ContentView';

import style from './Content.module.css';

const getDefaultView = (isWebpage: boolean, hasAttachment: boolean): ViewVariant => {
    if (isWebpage) return 'html';
    if (hasAttachment) return 'filepreview';
    return 'json';
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
    const [selectedView, setSelectedView] = useState<ViewVariant>(
        getDefaultView(isWebpage, hasAttachment)
    );

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment]);

    return (
        <>
            {selectedContentId ? (
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
                    <ContentView selectedView={selectedView} isLoading={isLoading} data={data} />
                </div>
            ) : null}
        </>
    );
};