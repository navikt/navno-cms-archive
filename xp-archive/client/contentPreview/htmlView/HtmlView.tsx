import React from 'react';
import style from './HtmlView.module.css';

type Props = {
    html: string;
};

export const HtmlView = ({ html }: Props) => {
    return (
        <div className={style.content}>
            <iframe srcDoc={html} className={style.iframe}></iframe>
        </div>
    );
};
