import React, { useState } from 'react';
import { useFetchContent } from '../hooks/useFetchContent';
import { Heading, Loader } from '@navikt/ds-react';
import { useAppState } from '../context/appState/useAppState';
import { ViewSelector, ViewVariant } from 'client/viewSelector/ViewSelector';
import { ContentHtmlView } from 'client/contentHtmlView/ContentHtmlView';
import { ContentJsonView } from 'client/contentJsonView/contentJsonView';
import { ContentFilesView } from 'client/contentFilesView/ContentFilesView';
import { ContentServiceResponse } from 'shared/types';

import style from './ContentView.module.css';

const getDisplayComponent = (viewVariant: ViewVariant, data: ContentServiceResponse) => {
    const translations: Record<ViewVariant, React.ReactElement> = {
        html: <ContentHtmlView html={data.html} />,
        json: <ContentJsonView json={data.json} />,
        files: <ContentFilesView />,
    };
    return translations[viewVariant];
};

export const ContentView = () => {
    const { selectedContentId } = useAppState();
    const { data, isLoading } = useFetchContent(selectedContentId || '');

    const [selectedView, setSelectedView] = useState<ViewVariant>('json');

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            {data ? (
                <div className={style.content}>
                    <Heading size={'medium'}>{data?.json.displayName}</Heading>
                    <ViewSelector selectedView={selectedView} setSelectedView={setSelectedView} />
                    {getDisplayComponent(selectedView, data)}
                </div>
            ) : null}
        </>
    );
};
