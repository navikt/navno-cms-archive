import React, { useState, useEffect } from 'react';
import { SidebarRightIcon } from '@navikt/aksel-icons';
import { Button, Detail, Heading, Label } from '@navikt/ds-react';
import { useFetchContent } from '../hooks/useFetchContent';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { VersionSelector } from 'client/versionSelector/VersionSelector';
import { ContentView } from '../contentView/ContentView';
import { formatTimestamp } from '@common/shared/timestamp';
import { EmptyState } from '@common/shared/EmptyState/EmptyState';

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
    const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    if (!selectedContentId) {
        return <EmptyState />;
    }

    return (
        <div className={style.content}>
            <div className={style.top}>
                <div>
                    <Detail spacing>{data?.json._path ?? ''}</Detail>
                    <Heading size={'medium'} level={'2'} spacing>
                        {data?.json.displayName ?? ''}
                    </Heading>
                    <ViewSelector
                        selectedView={selectedView}
                        setSelectedView={setSelectedView}
                        hasAttachment={hasAttachment}
                        isWebpage={isWebpage}
                    />
                </div>
                <div className={style.versionSelector}>
                    <Label spacing>Versjoner</Label>
                    <Button
                        className={style.versionButton}
                        variant={'secondary'}
                        icon={<SidebarRightIcon />}
                        iconPosition={'right'}
                        onClick={() => setIsVersionPanelOpen(true)}
                    >
                        {selectedVersion && data?.versions
                            ? formatTimestamp(
                                  data.versions.find((v) => v.versionId === selectedVersion)
                                      ?.timestamp ?? ''
                              )
                            : data?.versions?.[0]
                              ? `${formatTimestamp(data.versions[0].timestamp, true)} (Siste versjon)`
                              : 'Laster...'}
                    </Button>
                    <VersionSelector
                        versions={data?.versions || []}
                        isOpen={isVersionPanelOpen}
                        onClose={() => setIsVersionPanelOpen(false)}
                    />
                </div>
            </div>
            <ContentView
                selectedView={selectedView || getDefaultView(isWebpage, hasAttachment)}
                isLoading={isLoading}
                data={data}
            />
        </div>
    );
};
