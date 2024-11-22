import React from 'react';
import style from './HtmlView.module.css';

type Props = {
    html: string | undefined;
};

export const HtmlView = ({ html }: Props) => {
    if (!html) {
        return <div>Ingenting å forhåndsvise</div>;
    }
    return (
        <div className={style.wrapper}>
            <iframe title={'HTML-visning'} srcDoc={html} className={style.iframe}></iframe>;
        </div>
    );
};
