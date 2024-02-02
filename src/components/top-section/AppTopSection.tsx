import React from 'react';
import { InternalHeader, Spacer } from '@navikt/ds-react';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';
import NavLogo from '../../assets/nav-logo-white.svg';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    return (
        <InternalHeader className={style.header}>
            <InternalHeader.Title>
                <img src={NavLogo} alt={''} />
            </InternalHeader.Title>
            <InternalHeader.Title>{`CMS-arkiv`}</InternalHeader.Title>
            <InternalHeader.Title>{cmsName}</InternalHeader.Title>
            <Spacer />
            <ArchiveSelector />
        </InternalHeader>
    );
};
