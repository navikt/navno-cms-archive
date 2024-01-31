import React, { useEffect, useRef } from 'react';
import { classNames } from '../../../../utils/classNames';

import style from './HtmlView.module.css';

type Props = {
    html: string;
    hidden: boolean;
};

export const HtmlView = ({ html, hidden }: Props) => {
    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            console.error('Iframe element not found!');
            return;
        }

        element.querySelectorAll('a').forEach((a) => (a.onclick = (e) => e.preventDefault()));
    }, [html]);

    return (
        <iframe
            srcDoc={html}
            className={classNames(style.html, hidden && style.hidden)}
            ref={ref}
        />
    );
};
