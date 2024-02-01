import React from 'react';
import { Heading } from '@navikt/ds-react';
import NavLogo from '../../assets/nav-logo-black.svg';
import { ArchiveSelector } from './archive-selector/ArchiveSelector';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    return (
        <div className={style.topSection}>
            <div className={style.header}>
                <img src={NavLogo} alt={''} className={style.logo} />
                <Heading size={'large'} level={'1'}>
                    {`Arkiv - ${cmsName}`}
                </Heading>
            </div>
            <ArchiveSelector />
        </div>
    );
};
