import React, { useState, useEffect } from 'react';
import { SidebarRightIcon } from '@navikt/aksel-icons';
import { Button, Detail, Heading } from '@navikt/ds-react';
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
    const { selectedContentId, selectedLocale, selectedVersion, setSelectedVersion } =
        useAppState();

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        if (pathSegments.length >= 5) {
            // URL format: /xp/{nodeId}/{locale}/{versionId}
            const versionId = pathSegments[4];
            setSelectedVersion(versionId);
        }
    }, []);

    const { data, isLoading } = useFetchContent({
        id: selectedContentId ?? '',
        locale: selectedLocale,
        versionId: selectedVersion ?? '',
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
                <div>
                    <Detail spacing>{data?.json._path}</Detail>
                    <Heading size={'medium'} level={'2'} spacing>
                        {data?.json.displayName}
                    </Heading>
                    <ViewSelector
                        selectedView={selectedView}
                        setSelectedView={setSelectedView}
                        hasAttachment={hasAttachment}
                        isWebpage={isWebpage}
                    />
                </div>
                {/* <VersionSelector versions={data?.versions || []} /> */}
                <Button
                    className={style.versionButton}
                    variant={'secondary'}
                    icon={<SidebarRightIcon />}
                    iconPosition={'right'}
                >
                    Siste versjon
                </Button>
            </div>
            <ContentView
                selectedView={selectedView || getDefaultView(isWebpage, hasAttachment) || 'html'}
                isLoading={isLoading}
                data={data}
            />
        </div>
    );
};
