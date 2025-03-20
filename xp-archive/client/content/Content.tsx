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
import {
    setCachedVersionSelector,
    getCachedVersionSelector,
    clearCachedVersionSelector,
} from 'client/versionSelector/VersionSelectorCache';

import style from './Content.module.css';

const getDefaultView = (isWebpage: boolean, hasAttachment: boolean): ViewVariant | undefined => {
    if (isWebpage) return 'html';
    if (hasAttachment) return 'filepreview';
    return undefined;
};

export const Content = () => {
    const { selectedContentId, selectedLocale, selectedVersion, setSelectedVersion } =
        useAppState();

    const prevContentIdRef = React.useRef(selectedContentId);

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
        const versionId = selectedVersion ?? data?.versions?.[0]?.versionId;
        if (versionId) {
            if (!selectedVersion) {
                setSelectedVersion(versionId);
            }
            const newUrl = `${xpArchiveConfig.basePath}/${selectedContentId}/${selectedLocale}/${versionId}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [data, selectedContentId, selectedLocale, selectedVersion]);

    // Calculate derived properties
    const isWebpage = !!data?.html && !data?.json?.attachment;
    const hasAttachment = !!data?.json?.attachment;

    // State for view selector
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(() =>
        getDefaultView(isWebpage, hasAttachment)
    );

    // Update view when content type changes
    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    // Single cache for content-related data
    const [contentCache, setContentCache] = useState(() => ({
        // Version selector
        versions: getCachedVersionSelector(selectedContentId ?? '').versions,
        versionComponent: getCachedVersionSelector(selectedContentId ?? '').component,
        isVersionPanelOpen: getCachedVersionSelector(selectedContentId ?? '').isOpen,

        // Display data
        displayName: '',
        path: '',
    }));

    // Update cache when content changes
    useEffect(() => {
        if (prevContentIdRef.current && prevContentIdRef.current !== selectedContentId) {
            clearCachedVersionSelector(prevContentIdRef.current);
        }

        if (data?.versions && selectedContentId) {
            setContentCache((prev) => ({
                ...prev,
                versions: data.versions,
                versionComponent: null,
                displayName: data.json?.displayName || prev.displayName,
                path: data.json?._path || prev.path,
            }));
        }

        prevContentIdRef.current = selectedContentId;
    }, [selectedContentId, data?.versions, data?.json]);

    // Helper functions to get data with fallbacks
    const getVersionDisplay = () => {
        if (selectedVersion && contentCache.versions.length > 0) {
            const cachedVersion = contentCache.versions.find(
                (v) => v.versionId === selectedVersion
            );
            if (cachedVersion?.timestamp) {
                return formatTimestamp(cachedVersion.timestamp);
            }
        }

        if (selectedVersion && data?.versions) {
            return formatTimestamp(
                data.versions.find((v) => v.versionId === selectedVersion)?.timestamp ?? ''
            );
        }

        return 'Laster...';
    };

    const getDisplayName = () => data?.json?.displayName || contentCache.displayName || 'Laster...';
    const getPath = () => data?.json?._path || contentCache.path || '';

    const htmlPath = `${xpArchiveConfig.basePath}/html/${selectedContentId}/${selectedLocale}/${
        data?.json._versionKey
    }`;

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
                            onClick={() => {
                                setContentCache((prev) => ({
                                    ...prev,
                                    isVersionPanelOpen: true,
                                }));
                            }}
                        >
                            {getVersionDisplay()}
                        </Button>

                        {contentCache.versionComponent ? (
                            contentCache.versionComponent
                        ) : (
                            <VersionSelector
                                versions={
                                    contentCache.versions.length > 0
                                        ? contentCache.versions
                                        : data?.versions || []
                                }
                                isOpen={contentCache.isVersionPanelOpen}
                                onClose={() => {
                                    setContentCache((prev) => ({
                                        ...prev,
                                        isVersionPanelOpen: false,
                                    }));
                                }}
                                onMount={(component) => {
                                    setCachedVersionSelector(
                                        selectedContentId ?? '',
                                        component,
                                        contentCache.versions.length > 0
                                            ? contentCache.versions
                                            : data?.versions || [],
                                        contentCache.isVersionPanelOpen
                                    );

                                    setContentCache((prev) => ({
                                        ...prev,
                                        versionComponent: component,
                                    }));
                                }}
                            />
                        )}
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
                        {getDisplayName()}
                    </Heading>
                    <div className={style.url}>
                        <Detail>{getPath()}</Detail>
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
