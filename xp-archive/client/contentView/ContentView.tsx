import React from 'react';
import { ViewVariant } from 'client/viewSelector/ViewSelector';
import { PdfExport } from 'client/contentView/pdfExport/PdfExport';
import { ContentServiceResponse } from 'shared/types';
import { Loader } from '@navikt/ds-react';
import { HtmlView } from './htmlView/HtmlView';
import { FilePreviewWrapper } from './filePreview/FilePreviewWrapper';

import style from './ContentView.module.css';

const getDisplayComponent = (viewVariant: ViewVariant, data?: ContentServiceResponse | null) => {
    if (!data) return null;
    const components: Record<ViewVariant, React.ReactElement> = {
        html: <HtmlView versionId={data.json._id} locale={data.json.language} />,
        filepreview: <FilePreviewWrapper content={data.json} />,
        pdf: <PdfExport versions={data.versions} />,
    };
    return components[viewVariant];
};

type Props = {
    selectedView: ViewVariant;
    isLoading: boolean;
    data?: ContentServiceResponse | null;
};

export const ContentView = ({ selectedView, isLoading, data }: Props) => {
    if (isLoading) {
        return <Loader size="xlarge" />;
    }
    return <div className={style.main}>{getDisplayComponent(selectedView, data)}</div>;
};
