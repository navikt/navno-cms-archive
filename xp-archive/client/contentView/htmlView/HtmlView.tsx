import React, { useState } from 'react';
import style from './HtmlView.module.css';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Loader } from '@navikt/ds-react';

type Props = {
    nodeId: string;
    locale: string;
    versionId: string;
};

export const HtmlView = ({ nodeId, locale, versionId }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const htmlPath = `${xpArchiveConfig.basePath}/html/${nodeId}/${locale}/${versionId}`;

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
