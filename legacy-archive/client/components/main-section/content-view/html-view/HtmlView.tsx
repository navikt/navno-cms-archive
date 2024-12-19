import React, { useRef } from 'react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';
import { Button } from '@navikt/ds-react';
import { useAppState } from '../../../../context/app-state/useAppState';
import { ExpandIcon } from '@navikt/aksel-icons';

import style from './HtmlView.module.css';

type Props = {
    html: string;
    versionKey: string;
    hidden: boolean;
};

export const HtmlView = ({ html, versionKey, hidden }: Props) => {
    const ref = useRef<HTMLIFrameElement>(null);

    const { appContext } = useAppState();
    const fullscreenPath = `${appContext.basePath}/html/${versionKey}`;

    return (
        <div className={classNames(style.wrapper, hidden && style.hidden)}>
            <Button
                size={'small'}
                variant={'primary'}
                as={'a'}
                href={fullscreenPath}
                className={style.fullscreenButton}
                icon={<ExpandIcon />}
                onClick={(e) => {
                    e.preventDefault();
                    window.open(fullscreenPath, '_blank');
                }}
            >
                {'Åpne i nytt vindu'}
            </Button>
            <iframe
                srcDoc={html}
                className={classNames(style.htmlFrame)}
                ref={ref}
                onLoad={(e) => disableLinksAndEventListeners(e.currentTarget)}
            />
        </div>
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
