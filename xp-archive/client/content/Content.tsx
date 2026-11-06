import React, { useEffect, useState } from 'react';
import { Detail, Heading } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { ContentView } from '../contentView/ContentView';
import { formatTimestamp } from '@common/shared/timestamp';
import { EmptyState } from '@common/shared/EmptyState/EmptyState';

import style from './Content.module.css';
import { useCacheContent, useFetchContent } from '../hooks/useFetchContent';

const getDefaultView = (isWebpage: boolean, hasAttachment: boolean): ViewVariant | undefined => {
    if (isWebpage) return 'html';
    if (hasAttachment) return 'filepreview';
    return undefined;
};

export const Content = () => {
    const { selectedContentId, selectedLocale, selectedVersion, updateSelectedContent } =
        useAppState();
    const cacheContent = useCacheContent();

    const { data, isLoading } = useFetchContent({
        id: selectedContentId ?? '',
        locale: selectedLocale ?? 'no',
        versionId: selectedVersion ?? '',
    });

    const isWebpage = !!data?.html && !data?.json?.attachment;
    const hasAttachment = !!data?.json?.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    // XP renders the latest published version when no version is selected. Put its versionId in
    // the url, and reuse the response instead of fetching it again
    useEffect(() => {
        if (selectedVersion || !data) return;
        if (!selectedContentId || !selectedLocale) return;

        const { _id, locale, _versionKey } = data.json;
        if (_id !== selectedContentId || locale !== selectedLocale) return;
        if (!data.versions?.some((version) => version.versionId === _versionKey)) return;

        const params = { id: _id, locale, versionId: _versionKey };
        void cacheContent(params, data);
        updateSelectedContent(
            { contentId: _id, locale, versionId: _versionKey },
            { replaceUrl: true }
        );
    }, [
        data,
        selectedVersion,
        selectedContentId,
        selectedLocale,
        cacheContent,
        updateSelectedContent,
    ]);

    if (!selectedContentId) {
        return <EmptyState />;
    }

    const unpublishedTime = data?.json?.unpublishedTime;

    return (
        <div className={style.content}>
            <div className={style.top}>
                <div>
                    <div className={style.heading}>
                        <Heading size={'medium'} level={'2'}>
                            {data?.json?.displayName || 'Laster...'}
                        </Heading>
                        {unpublishedTime && (
                            <div className={style.archivedOrUnpublished}>
                                <Detail>{`Avpublisert: ${formatTimestamp(unpublishedTime)}`}</Detail>
                            </div>
                        )}
                    </div>
                    <div className={style.url}>
                        <Detail>{data?.json?._path || ''}</Detail>
                    </div>
                </div>

                <ViewSelector
                    selectedView={selectedView}
                    setSelectedView={setSelectedView}
                    hasAttachment={hasAttachment}
                    isWebpage={isWebpage}
                />
            </div>

            <ContentView
                selectedView={selectedView || getDefaultView(isWebpage, hasAttachment)}
                isLoading={isLoading}
                data={data}
            />
        </div>
    );
};
