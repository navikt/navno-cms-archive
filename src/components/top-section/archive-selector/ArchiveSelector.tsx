import React from 'react';
import { Select } from '@navikt/ds-react';
import { useAppState } from '../../../context/app-state/useAppState';

import style from './ArchiveSelector.module.css';

export const ArchiveSelector = () => {
    const { appContext } = useAppState();

    return (
        <div className={style.archiveSelector}>
            <label>{'Velg arkiv: '}</label>
            <Select
                label={'Velg arkiv'}
                hideLabel={true}
                defaultValue={appContext.basePath}
                size={'small'}
                onChange={(e) => window.location.assign(e.target.value)}
            >
                <option value={'/sbs'}>{'Selvbetjeningssonen'}</option>
                <option value={'/fss'}>{'Fagsystemsonen'}</option>
            </Select>
        </div>
    );
};
