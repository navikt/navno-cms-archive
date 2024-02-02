import React from 'react';
import { InternalHeader, Spacer } from '@navikt/ds-react';
import NavLogo from '../../assets/nav-logo-white.svg';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    return (
        <div className={style.topSection}>
            <InternalHeader className={style.header}>
                <InternalHeader.Title>
                    <img src={NavLogo} alt={''} />
                </InternalHeader.Title>
                <InternalHeader.Title>{`CMS-arkiv`}</InternalHeader.Title>
                <InternalHeader.Title>{cmsName}</InternalHeader.Title>
                <Spacer />
                <ArchiveSelector />
            </InternalHeader>
        </div>
    );
};
