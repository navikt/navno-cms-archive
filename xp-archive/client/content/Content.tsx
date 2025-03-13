import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon, SidebarRightIcon } from '@navikt/aksel-icons';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
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

// Storage key for persisting version selector state
const STORAGE_KEY = 'versionSelector_state';

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

    useEffect(() => {
        if (selectedVersion) {
            const newUrl = `${xpArchiveConfig.basePath}/${selectedContentId}/${selectedLocale}/${selectedVersion}`;
            window.history.replaceState({}, '', newUrl);
        } else if (data?.versions?.[0]) {
            const latestVersionId = data.versions[0].versionId;
            setSelectedVersion(latestVersionId);
            const newUrl = `${xpArchiveConfig.basePath}/${selectedContentId}/${selectedLocale}/${latestVersionId}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [data, selectedContentId, selectedLocale, selectedVersion]);

    const isWebpage = !!data?.html && !data.json.attachment;
    const hasAttachment = !!data?.json.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    // Initialize version panel state from localStorage
    const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const { keepOpen } = JSON.parse(savedState);
                return !!keepOpen;
            }
        } catch (e) {
            console.error('Failed to load version selector state', e);
        }
        return false;
    });

    // Check localStorage when data changes to see if we should keep panel open
    useEffect(() => {
        if (data) {
            try {
                const savedState = localStorage.getItem(STORAGE_KEY);
                if (savedState) {
                    const { keepOpen } = JSON.parse(savedState);
                    if (keepOpen) {
                        setIsVersionPanelOpen(true);
                        // Clear the keepOpen flag after opening
                        const updatedState = JSON.parse(savedState);
                        updatedState.keepOpen = false;
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
                    }
                }
            } catch (e) {
                console.error('Failed to load version selector state', e);
            }
        }
    }, [data]);

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    const htmlPath = `${xpArchiveConfig.basePath}/html/${selectedContentId}/${selectedLocale}/${
        data?.json._versionKey
    }`;

    const getVersionDisplay = () => {
        if (selectedVersion && data?.versions) {
            return formatTimestamp(
                data.versions.find((v) => v.versionId === selectedVersion)?.timestamp ?? ''
            );
        }
        return 'Laster...';
    };

    if (!selectedContentId) {
        return <EmptyState />;
    }

    return (
        <div className={style.content}>
            <div className={style.top}>
                <div className={style.versionAndViewWrapper}>
                    <div className={style.versionSelector}>
                        <Label className={style.label}>Versjoner</Label>
                        <Button
                            className={style.versionButton}
                            variant={'secondary'}
                            icon={<SidebarRightIcon />}
                            iconPosition={'right'}
                            onClick={() => setIsVersionPanelOpen(true)}
                        >
                            {getVersionDisplay()}
                        </Button>
                        <VersionSelector
                            versions={data?.versions || []}
                            isOpen={isVersionPanelOpen}
                            onClose={() => setIsVersionPanelOpen(false)}
                        />
                    </div>
                    <div className={style.viewSelector}>
                        <Label className={style.label}>Visning</Label>
                        <div className={style.viewSelectorWrapper}>
                            <ViewSelector
                                selectedView={selectedView}
                                setSelectedView={setSelectedView}
                                hasAttachment={hasAttachment}
                                isWebpage={isWebpage}
                            />
                            <Button
                                as={'a'}
                                href={htmlPath}
                                icon={<ExternalLinkIcon />}
                                iconPosition={'right'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.open(htmlPath, '_blank');
                                }}
                            >
                                {'Åpne i nytt vindu'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={style.titleAndUrl}>
                    <Heading size={'medium'} level={'2'}>
                        {data?.json.displayName ?? ''}
                    </Heading>
                    <div className={style.url}>
                        <Detail>{data?.json._path ?? ''}</Detail>
                    </div>
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
