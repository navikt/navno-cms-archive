import React from 'react';
import { classNames } from '../../../../utils/classNames';

import style from './HtmlView.module.css';

type Props = {
    html: string;
    hidden: boolean;
};

export const HtmlView = ({ html, hidden }: Props) => {
    return (
        <iframe
            srcDoc={html}
            className={classNames(style.html, hidden && style.hidden)}
        />
    );
};
