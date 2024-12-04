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
    console.log('HtmlView rendered with:', { versionId, locale });

    const fullscreenPath = `${xpArchiveConfig.basePath}/html/${versionId}/${locale || ''}`;
    console.log('iframe src:', fullscreenPath);

    return (
        <div className={style.wrapper}>
            <iframe title={'HTML-visning'} src={fullscreenPath} className={style.iframe} />
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
