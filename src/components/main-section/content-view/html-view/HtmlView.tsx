import React from 'react';
import { classNames } from '../../../../utils/classNames.ts';

import style from './HtmlView.module.css';

type Props = {
    html?: string;
    hidden?: boolean;
};

export const HtmlView = ({ html, hidden }: Props) => {
    return html ? (
        <iframe
            srcDoc={html}
            className={classNames(style.html, hidden && style.hidden)}
        />
    ) : null;
};
