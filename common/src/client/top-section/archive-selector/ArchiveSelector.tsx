import React from 'react';
import { Tabs } from '@navikt/ds-react';
import { siteConfigs } from '../../../shared/siteConfigs';

import style from './ArchiveSelector.module.css';

type Props = {
    basePath: string;
};

export const ArchiveSelector = ({ basePath }: Props) => {
    return (
        <Tabs
            className={style.archiveSelector}
            defaultValue={basePath}
            // onChange={(e) => window.location.assign(e.target.value)}
        >
            <Tabs.List>
                {siteConfigs.map((config) => (
                    <Tabs.Tab
                        className={style.tab}
                        value={config.basePath}
                        key={config.name}
                        label={config.name}
                    />
                ))}
            </Tabs.List>
        </Tabs>
    );
};

{
    /* <Select
                label={'Velg arkiv'}
                hideLabel={true}
                defaultValue={basePath}
                size={'small'}
                onChange={(e) => window.location.assign(e.target.value)}
            >
                {siteConfigs.map((config) => (
                    <option value={config.basePath} key={config.name}>
                        {config.name}
                    </option>
                ))}
            </Select> */
}
