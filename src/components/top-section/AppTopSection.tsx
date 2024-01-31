import React from 'react';
import { Heading, Select } from '@navikt/ds-react';
import { useAppState } from '../../state/useAppState';
import NavLogo from '../../assets/nav-logo-black.svg';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    const { appContext } = useAppState();

    return (
        <div className={style.topSection}>
            <div className={style.header}>
                <img src={NavLogo} alt={''} className={style.logo} />
                <Heading size={'large'} level={'1'}>
                    {`Arkiv - ${cmsName}`}
                </Heading>
            </div>
            <Select
                label={'Velg arkiv'}
                defaultValue={appContext.basePath}
                size={'small'}
                onChange={(e) => {
                    window.location.assign(e.target.value);
                }}
            >
                <option value={'/sbs'}>{'Selvbetjeningssonen'}</option>
                <option value={'/fss'}>{'Fagsystemsonen'}</option>
            </Select>
        </div>
    );
};
