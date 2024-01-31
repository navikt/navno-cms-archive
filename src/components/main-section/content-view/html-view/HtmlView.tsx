import React, { useRef } from 'react';
import { classNames } from '../../../../utils/classNames';

import style from './HtmlView.module.css';

type Props = {
    html: string;
    hidden: boolean;
};

export const HtmlView = ({ html, hidden }: Props) => {
    const ref = useRef<HTMLIFrameElement>(null);

    return (
        <iframe
            srcDoc={html}
            className={classNames(style.html, hidden && style.hidden)}
            ref={ref}
            onLoad={(e) => disableLinksAndEventListeners(e.currentTarget)}
        />
    );
};

const disableLinksAndEventListeners = (iframeElement: HTMLIFrameElement | null) => {
    const document = iframeElement?.contentDocument;
    if (!document) {
        console.error('Iframe document not found!');
        return;
    }

    // eslint-disable-next-line no-self-assign
    document.body.innerHTML = document.body.innerHTML;

    document.querySelectorAll('a, button').forEach((element) => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
    });
};
