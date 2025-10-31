import React from 'react';
import { InternalHeader } from '@navikt/ds-react';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';

import style from './AppTopSection.module.css';

type Props = {
    basePath: string;
};

export const AppTopSection = ({ basePath }: Props) => {
    return (
        <div className={style.header}>
            <InternalHeader className={style.header}>
                <InternalHeader.Title>{`CMS-arkiv`}</InternalHeader.Title>
                <ArchiveSelector basePath={basePath} />
            </InternalHeader>
        </div>
    );
};
