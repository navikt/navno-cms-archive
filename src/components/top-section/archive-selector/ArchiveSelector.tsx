import React from 'react';
import { Select } from '@navikt/ds-react';
import { useAppState } from '../../../context/app-state/useAppState';

import style from './ArchiveSelector.module.css';
import { archiveConfigs } from '../../../../common/archiveConfigs';

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
                {archiveConfigs.map((config) => (
                    <option value={config.basePath} key={config.name}>
                        {config.name}
                    </option>
                ))}
            </Select>
        </div>
    );
};
