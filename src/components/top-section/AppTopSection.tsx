import React from 'react';
import { Heading, Select } from '@navikt/ds-react';
import { useAppState } from '../../state/useAppState';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    const { appContext } = useAppState();

    return (
        <div className={style.top}>
            <Heading size={'xlarge'} level={'1'}>
                {`Arkiv - ${cmsName}`}
            </Heading>
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
