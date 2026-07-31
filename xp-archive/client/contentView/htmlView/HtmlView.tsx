import React, { useState } from 'react';
import style from './HtmlView.module.css';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Alert, Loader } from '@navikt/ds-react';
import { Content, VersionReference } from '../../../shared/types';
import { formatTimestamp } from '../../../../common/src/shared/timestamp';

type Props = {
    content: Content;
    versions: VersionReference[];
};

const getUnpublishedWarningText = (content: Content, versions: VersionReference[]) => {
    if (content.originalContentTypeName && content.type === 'no.nav.navno:internal-link') {
        const v = versions.find((version, index, versions) => {
            const nextVersion = versions[index + 1];
            return (
                version.type === 'no.nav.navno:internal-link' &&
                !!nextVersion &&
                nextVersion.type !== 'no.nav.navno:internal-link'
            );
        });

        return v
            ? `Siden ble endret til en intern lenke med videresending til nytt innhold den ${formatTimestamp(v.timestamp)}. Fra dette tidspunktet var innholdet ikke lenger tilgjengelig på nav.no.`
            : '';
    }

    return '';
};

const localeNames: Record<string, string> = {
    no: 'norsk (bokmål)',
    nn: 'nynorsk',
    en: 'engelsk',
    se: 'samisk',
};

export const HtmlView = ({ content, versions }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const htmlPath = `${xpArchiveConfig.basePath}/html/${content._id}/${content.locale}/${content._versionKey}`;

    return (
        <div className={style.wrapper}>
            {content.originalContentTypeName ? (
                <Alert variant="warning">{`Obs! Denne siden var opprinnelig en "${content.originalContentTypeName}" og inneholder versjonshistorikken. ${getUnpublishedWarningText(content, versions)}`}</Alert>
            ) : null}
            {content.x?.['no-nav-navno']?.redirectToLayer?.locale ? (
                <Alert variant="warning">{`Obs! Denne siden er satt som redirect til språkversjonen for "${localeNames[content.x['no-nav-navno'].redirectToLayer.locale]}". Husk å velge riktig språkversjon for å se korrekt historikk.`}</Alert>
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
