import React, { useState } from 'react';
import style from './HtmlView.module.css';
import { ExpandIcon } from '@navikt/aksel-icons';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Button, Loader } from '@navikt/ds-react';

type Props = {
    versionId: string;
    locale: string;
};

export const HtmlView = ({ versionId, locale }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const htmlPath = `${xpArchiveConfig.basePath}/html/${versionId}/${locale || ''}`;
    return (
        <div className={style.wrapper}>
            {isLoading && (
                <div className={style.loaderWrapper}>
                    <Loader size="xlarge" />
                </div>
            )}
            <iframe
                title={'HTML-visning'}
                src={htmlPath}
                className={style.iframe}
                onLoad={(e) => {
                    setIsLoading(false);
                    disableLinksScriptsAndEventListeners(e.currentTarget);
                }}
            />
            <Button
                as={'a'}
                href={htmlPath}
                className={style.fullscreenButton}
                icon={<ExpandIcon />}
                onClick={(e) => {
                    e.preventDefault();
                    window.open(htmlPath, '_blank');
                }}
            >
                {'Åpne i nytt vindu'}
            </Button>
        </div>
    );
};

const disableLinksScriptsAndEventListeners = (iframeElement: HTMLIFrameElement | null) => {
    const document = iframeElement?.contentDocument;
    if (!document) {
        console.error('Iframe document not found!');
        return;
    }

    document.querySelectorAll('a, button').forEach((element) => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
    });

    document.querySelectorAll('script').forEach((element) => {
        element.remove();
    });
};
