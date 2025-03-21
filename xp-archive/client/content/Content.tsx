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
            window.history.pushState({}, '', newUrl);
        }
    }, [data, selectedContentId, selectedLocale, selectedVersion]);

    const isWebpage = !!data?.html && !data?.json?.attachment;
    const hasAttachment = !!data?.json?.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    const [versionSelectorCache, setVersionSelectorCache] = useState(() => {
        const cache = getCachedVersionSelector(selectedContentId ?? '');
        return {
            component: cache.component,
            versions: cache.versions,
            isOpen: cache.isOpen,
        };
    });

    const [cachedDisplayData, setCachedDisplayData] = useState({
        displayName: '',
        path: '',
    });

    useEffect(() => {
        if (prevContentIdRef.current && prevContentIdRef.current !== selectedContentId) {
            clearCachedVersionSelector(prevContentIdRef.current);
        }

        if (data?.versions && selectedContentId) {
            setVersionSelectorCache((prev) => ({
                component: null,
                versions: data.versions,
                isOpen: prev.isOpen,
            }));

            if (data.json?.displayName || data.json?._path) {
                setCachedDisplayData({
                    displayName: data.json.displayName || '',
                    path: data.json._path || '',
                });
            }
        }

        prevContentIdRef.current = selectedContentId;
    }, [selectedContentId, data?.versions, data?.json]);

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    const htmlPath = `${xpArchiveConfig.basePath}/html/${selectedContentId}/${selectedLocale}/${
        data?.json._versionKey
    }`;

    const getVersionDisplay = () => {
        if (selectedVersion && versionSelectorCache.versions.length > 0) {
            const cachedVersion = versionSelectorCache.versions.find(
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

    const getDisplayName = () => {
        return data?.json?.displayName || cachedDisplayData.displayName || 'Laster...';
    };

    const getPath = () => {
        return data?.json?._path || cachedDisplayData.path || '';
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
                            onClick={() => {
                                setVersionSelectorCache((prev) => ({
                                    ...prev,
                                    isOpen: true,
                                }));
                            }}
                        >
                            {getVersionDisplay()}
                        </Button>

                        {versionSelectorCache.component
                            ? versionSelectorCache.component
                            : (() => {
                                  const versionSelectorVersions =
                                      versionSelectorCache.versions.length > 0
                                          ? versionSelectorCache.versions
                                          : data?.versions || [];

                                  const handleClose = () => {
                                      setVersionSelectorCache((prev) => ({
                                          ...prev,
                                          isOpen: false,
                                      }));
                                  };

                                  const handleMount = (component: React.ReactNode) => {
                                      setCachedVersionSelector(
                                          selectedContentId ?? '',
                                          component,
                                          versionSelectorVersions,
                                          versionSelectorCache.isOpen
                                      );
                                  };

                                  return (
                                      <VersionSelector
                                          versions={versionSelectorVersions}
                                          isOpen={versionSelectorCache.isOpen}
                                          onClose={handleClose}
                                          onMount={handleMount}
                                      />
                                  );
                              })()}
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
