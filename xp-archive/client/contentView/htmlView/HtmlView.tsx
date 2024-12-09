import React from 'react';
import style from './HtmlView.module.css';
import { ExpandIcon } from '@navikt/aksel-icons';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Button } from '@navikt/ds-react';

type Props = {
    versionId: string;
    locale: string;
};

export const HtmlView = ({ versionId, locale }: Props) => {
    const htmlPath = `${xpArchiveConfig.basePath}/html/${versionId}/${locale || ''}`;

    return (
        <div className={style.wrapper}>
            <iframe title={'HTML-visning'} src={htmlPath} className={style.iframe} />
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
