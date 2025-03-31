import React from 'react';
import { Tabs } from '@navikt/ds-react';
import { siteConfigs } from '../../../shared/siteConfigs';

import style from './ArchiveSelector.module.css';

type Props = {
    basePath: string;
};

export const ArchiveSelector = ({ basePath }: Props) => {
    return (
        <Tabs defaultValue={basePath} onChange={(e) => window.location.assign(e)}>
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
