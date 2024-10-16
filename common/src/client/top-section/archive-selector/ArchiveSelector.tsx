import React from 'react';
import { Select } from '@navikt/ds-react';
import { siteConfigs } from '../../../shared/siteConfigs';

import style from './ArchiveSelector.module.css';

type Props = {
    basePath: string;
};

export const ArchiveSelector = ({ basePath }: Props) => {
    return (
        <div className={style.archiveSelector}>
            <label>{'Velg arkiv: '}</label>
            <Select
                label={'Velg arkiv'}
                hideLabel={true}
                defaultValue={basePath}
                size={'small'}
                onChange={(e) => window.location.assign(e.target.value)}
            >
                {siteConfigs.map((config) => (
                    <option value={config.baseUrl} key={config.name}>
                        {config.name}
                    </option>
                ))}
            </Select>
        </div>
    );
};
