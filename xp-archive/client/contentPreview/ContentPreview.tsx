import React from 'react';
import { HtmlView } from './htmlView/HtmlView';

type Props = {
    html: string | undefined;
    attachment: unknown | undefined;
};

export const ContentPreview = ({ html, attachment }: Props) => {
    if (!html && !attachment) {
        return <div>Ingenting å forhåndsvise</div>;
    }

    if (attachment) {
        return <div>Vedlegg</div>;
    }

    if (html) {
        return <HtmlView html={html} />;
    }
};
