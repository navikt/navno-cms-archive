import React, { useEffect, useState } from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { ContentPreview } from 'client/contentPreview/ContentPreview';
import { ContentJsonView } from 'client/contentJsonView/contentJsonView';
import { VersionSelector } from 'client/versionSelector/VersionSelector';
import { ContentServiceResponse } from 'shared/types';

import style from './ContentView.module.css';

const getDisplayComponent = (viewVariant: ViewVariant, data: ContentServiceResponse) => {
    const components: Record<ViewVariant, React.ReactElement> = {
        preview: <ContentPreview html={data.html} content={data.json} />,
        json: <ContentJsonView json={data.json} />,
    };
    return components[viewVariant];
};

export const ContentView = () => {
    const { selectedContentId, selectedLocale, selectedVersion } = useAppState();

    const fetchId = selectedVersion?.nodeId ?? selectedContentId;

    const { data, isLoading } = useFetchContent({
        id: fetchId || '',
        locale: selectedLocale,
        versionId: selectedVersion?.versionId ?? undefined,
    });

    const hasPreview = !!data?.html || !!data?.json.attachment;
    const [selectedView, setSelectedView] = useState<ViewVariant>('preview');

    useEffect(() => {
        setSelectedView(hasPreview ? 'preview' : 'json');
    }, [hasPreview]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            {data ? (
                <div className={style.content}>
                    <div className={style.top}>
                        <div>
                            <Heading size={'medium'}>{data?.json.displayName}</Heading>
                            <ViewSelector
                                selectedView={selectedView}
                                setSelectedView={setSelectedView}
                                hasPreview={hasPreview}
                            />
                        </div>
                        <VersionSelector versions={data.versions} />
                    </div>
                    <div className={style.main}>{getDisplayComponent(selectedView, data)}</div>
                </div>
            ) : null}
        </>
    );
};
