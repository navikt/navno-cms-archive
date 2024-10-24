import React from 'react';

type Props = {
    html?: string;
};

export const ContentHtmlView = ({ html }: Props) => {
    return <div>{html}</div>;
};
