import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { VersionIcon } from '../versionSelector/VersionIcon';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Button, Detail, Heading, Label } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { ContentView } from '../contentView/ContentView';
import { ContentServiceResponse } from '../../shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { EmptyState } from '@common/shared/EmptyState/EmptyState';

import style from './Content.module.css';

const getDefaultView = (isWebpage: boolean, hasAttachment: boolean): ViewVariant | undefined => {
    if (isWebpage) return 'html';
    if (hasAttachment) return 'filepreview';
    return undefined;
};

export const Content = ({
    data,
    isLoading,
}: {
    data: ContentServiceResponse | null | undefined;
    isLoading: boolean;
}) => {
    const {
        selectedContentId,
        selectedLocale,
        selectedVersion,
        versionViewOpen,
        setVersionViewOpen,
    } = useAppState();

    const isWebpage = !!data?.html && !data?.json?.attachment;
    const hasAttachment = !!data?.json?.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    useEffect(() => {
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    const htmlPath = `${xpArchiveConfig.basePath}/html/${data?.json._id}/${selectedLocale}/${
        data?.json._versionKey
    }`;

    const getVersionDisplay = () => {
        if (isLoading) return 'Laster...';
        if (data?.versions.length === 0 || !data) return 'Ingen versjoner';
        if (!selectedVersion) return formatTimestamp(data.versions[0].timestamp);

        return formatTimestamp(
            data.versions.find((v) => v.versionId === selectedVersion)?.timestamp ?? ''
        );
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
                            className={
                                versionViewOpen ? style.activeVersionButton : style.versionButton
                            }
                            variant={'secondary'}
                            icon={<VersionIcon isOpen={versionViewOpen} />}
                            onClick={() => setVersionViewOpen(!versionViewOpen)}
                        >
                            {getVersionDisplay()}
                        </Button>
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
                        {data?.json?.displayName || 'Laster...'}
                    </Heading>
                    <div className={style.url}>
                        <Detail>{data?.json?._path || ''}</Detail>
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
