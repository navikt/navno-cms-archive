import React from 'react';
import style from './HtmlView.module.css';
import { ExpandIcon } from '@navikt/aksel-icons';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Button } from '@navikt/ds-react';

type Props = {
    html: string | undefined;
    versionId: string;
    locale: string;
};

export const HtmlView = ({ html, versionId, locale }: Props) => {
    if (!html) {
        return <div>Ingenting å forhåndsvise</div>;
    }

    const fullscreenPath = `${xpArchiveConfig.basePath}/html/${versionId}/${locale || ''}`;

    return (
        <div className={style.wrapper}>
            <iframe title={'HTML-visning'} srcDoc={html} className={style.iframe}></iframe>;
            <Button
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
        </div>
    );
};
