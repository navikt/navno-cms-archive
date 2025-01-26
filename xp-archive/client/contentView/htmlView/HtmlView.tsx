import React, { useState } from 'react';
import style from './HtmlView.module.css';
import { ExpandIcon } from '@navikt/aksel-icons';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { Button, Loader } from '@navikt/ds-react';

type Props = {
    nodeId: string;
    locale: string;
};

export const HtmlView = ({ nodeId, locale }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const htmlPath = `${xpArchiveConfig.basePath}/html/${nodeId}/${locale || ''}`;

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
                onLoad={() => setIsLoading(false)}
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
