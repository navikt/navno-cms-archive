import React from 'react';
import { ViewVariant } from 'client/viewSelector/ViewSelector';
import { PdfExport } from 'client/contentView/pdfExport/PdfExport';
import { ContentServiceResponse } from 'shared/types';
import { Loader } from '@navikt/ds-react';
import { HtmlView } from './htmlView/HtmlView';
import { FilePreviewWrapper } from './filePreview/FilePreviewWrapper';

import style from './ContentView.module.css';

const getDisplayComponent = (
    viewVariant: ViewVariant | undefined,
    data?: ContentServiceResponse | null
) => {
    if (!data || !viewVariant) return null;

    const { json: content, versions } = data;

    const components: Record<ViewVariant, React.ReactElement> = {
        html: <HtmlView content={content} versions={versions} />,
        filepreview: <FilePreviewWrapper content={content} />,
        pdf: <PdfExport versions={data.versions} locale={content.locale} />,
    };
    return components[viewVariant];
};

type Props = {
    selectedView: ViewVariant | undefined;
    isLoading: boolean;
    data?: ContentServiceResponse | null;
};

export const ContentView = ({ selectedView, data, isLoading }: Props) => {
    if (isLoading && !data) {
        return <Loader size="xlarge" />;
    }
    return <div className={style.main}>{getDisplayComponent(selectedView, data)}</div>;
};
