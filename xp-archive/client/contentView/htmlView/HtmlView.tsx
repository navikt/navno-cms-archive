import React, { useState } from 'react';
import style from './HtmlView.module.css';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Alert, Loader } from '@navikt/ds-react';

type Props = {
    nodeId: string;
    locale: string;
    versionId: string;
    originalContentTypeName: string | undefined;
};

const localesToOverwrite = ['uk', 'ru'];

export const HtmlView = ({
    nodeId,
    locale: langLocale,
    versionId,
    originalContentTypeName,
}: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const locale = localesToOverwrite.includes(langLocale) ? 'no' : langLocale;
    const htmlPath = `${xpArchiveConfig.basePath}/html/${nodeId}/${locale}/${versionId}`;

    return (
        <div className={style.wrapper}>
            {originalContentTypeName ? (
                <Alert variant="warning">{`Obs! Denne siden var opprinnelig en "${originalContentTypeName}" og inneholder versjonshistorikk.`}</Alert>
            ) : null}
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

    document.querySelectorAll('a').forEach((element) => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
    });

    document.querySelectorAll('script').forEach((element) => {
        element.remove();
    });
};
