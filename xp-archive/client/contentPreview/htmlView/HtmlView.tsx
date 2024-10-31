import React from 'react';
import style from './HtmlView.module.css';

type Props = {
    html: string;
};

export const HtmlView = ({ html }: Props) => {
    return <iframe title={'HTML-visning'} srcDoc={html} className={style.iframe}></iframe>;
};
