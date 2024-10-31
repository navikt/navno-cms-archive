import React from 'react';
import { HtmlView } from './htmlView/HtmlView';
import { Content } from 'shared/types';
import { FilePreview } from './filePreview.tsx/FilePreview';

type Props = {
    html: string | undefined;
    content: Content;
};

export const ContentPreview = ({ html, content }: Props) => {
    if (content.attachment) {
        return <FilePreview id={content._id} versionId={content._versionKey} />;
    }

    if (html) {
        return <HtmlView html={html} />;
    }

    return <div>Ingenting å forhåndsvise</div>;
};
