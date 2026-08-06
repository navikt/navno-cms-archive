import React, { useEffect, useState } from 'react';
import { Detail, Heading } from '@navikt/ds-react';
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
    const { selectedContentId } = useAppState();

    const isWebpage = !!data?.html && !data?.json?.attachment;
    const hasAttachment = !!data?.json?.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant | undefined>(
        getDefaultView(isWebpage, hasAttachment)
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedView(getDefaultView(isWebpage, hasAttachment));
    }, [isWebpage, hasAttachment, selectedContentId]);

    if (!selectedContentId) {
        return <EmptyState />;
    }

    const unpublishedTime = 'Avpublisert 3.august'; //data?.json?.unpublishedTime ?? data?.json.archivedTime;

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
