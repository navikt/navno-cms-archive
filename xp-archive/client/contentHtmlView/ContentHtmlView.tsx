import React from 'react';
import style from './ContentHtmlView.module.css';

type Props = {
    html?: string;
};

export const ContentHtmlView = ({ html }: Props) => {
    if (!html) {
        return <div>Ingen innhold</div>;
    }
    return (
        <div className={style.content}>
            <iframe srcDoc={html} className={style.iframe}></iframe>
        </div>
    );
};
