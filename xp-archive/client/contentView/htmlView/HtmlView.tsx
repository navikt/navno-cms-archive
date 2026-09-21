import React, { useState } from 'react';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Alert, Loader, Button, Link, Box, Theme } from '@navikt/ds-react';
import { Content, VersionReference } from '../../../shared/types';
import { formatTimestamp } from '../../../../common/src/shared/timestamp';
import { VersionSelector } from '../../versionSelector/VersionSelector';
import { VersionIcon } from '../../versionSelector/VersionIcon';
import { useAppState } from '../../context/appState/useAppState';
import { ExternalLinkIcon } from '@navikt/aksel-icons';

import style from './HtmlView.module.css';

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

type Props = {
    content: Content;
    versions: VersionReference[];
};

export const HtmlView = ({ content, versions }: Props) => {
    const [loadedPath, setLoadedPath] = useState<string | null>(null);
    const htmlPath = `${xpArchiveConfig.basePath}/html/${content._id}/${content.locale}/${content._versionKey}`;
    const isLoading = loadedPath !== htmlPath;

    const { selectedVersion, versionViewOpen, setVersionViewOpen } = useAppState();

    const getVersionDisplay = () => {
        if (versions.length === 0 || !content) return 'Ingen versjoner';
        if (!selectedVersion) return formatTimestamp(versions[0].timestamp);

        return formatTimestamp(
            versions.find((v) => v.versionId === selectedVersion)?.timestamp ?? ''
        );
    };

    return (
        <Box className={style.wrapper} background={'neutral-strong'}>
            <Theme theme={'dark'} hasBackground={false} className={style.themeWrapper}>
                <div className={style.versionBar}>
                    <Button
                        size={'small'}
                        variant={'tertiary'}
                        data-color={'neutral'}
                        icon={<VersionIcon isOpen={versionViewOpen} />}
                        onClick={() => setVersionViewOpen(!versionViewOpen)}
                    >
                        {getVersionDisplay()}
                    </Button>
                    <Link
                        href={htmlPath}
                        data-color={'neutral'}
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(htmlPath, '_blank');
                        }}
                    >
                        {'Åpne i nytt vindu'}
                        <ExternalLinkIcon />
                    </Link>
                </div>
                <div className={style.versionsAndContent}>
                    {versionViewOpen && <VersionSelector versions={versions} />}
                    <div className={style.content}>
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
                                setLoadedPath(htmlPath);
                                disableLinksScriptsAndEventListeners(e.currentTarget);
                            }}
                        />
                    </div>
                </div>
            </Theme>
        </Box>
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
