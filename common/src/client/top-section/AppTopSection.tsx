import React from 'react';
import { Alert, InternalHeader, Spacer } from '@navikt/ds-react';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';

import style from './AppTopSection.module.css';

type Props = {
    basePath: string;
    showUnderDevAlert: boolean;
};

export const AppTopSection = ({ basePath, showUnderDevAlert }: Props) => {
    return (
        <div className={style.header}>
            <InternalHeader className={style.header}>
                <InternalHeader.Title>{`CMS-arkiv`}</InternalHeader.Title>
                <Spacer />
                <ArchiveSelector basePath={basePath} />
            </InternalHeader>
            {showUnderDevAlert ? (
                <Alert variant={'warning'} className={style.devAlert} fullWidth>
                    {
                        'Obs! Denne delen av arkivet er fortsatt under utvikling og er IKKE klar til bruk.'
                    }
                </Alert>
            ) : null}
        </div>
    );
};
