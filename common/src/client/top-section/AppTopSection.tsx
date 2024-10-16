import React from 'react';
import { InternalHeader, Spacer } from '@navikt/ds-react';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';
import NavLogo from '../../../assets/nav-logo-white.svg';

import style from './AppTopSection.module.css';

type Props = {
    siteName: string;
    basePath: string;
};

export const AppTopSection = ({ siteName, basePath }: Props) => {
    return (
        <InternalHeader className={style.header}>
            <InternalHeader.Title>
                <img src={NavLogo} alt={''} />
            </InternalHeader.Title>
            <InternalHeader.Title>{`CMS-arkiv`}</InternalHeader.Title>
            <InternalHeader.Title>{siteName}</InternalHeader.Title>
            <Spacer />
            <ArchiveSelector basePath={basePath} />
        </InternalHeader>
    );
};
