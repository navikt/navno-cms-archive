import React from 'react';
import { Heading } from '@navikt/ds-react';

import style from './AppHeader.module.css';

type Props = {
    cmsName: string;
};

export const AppHeader = ({ cmsName }: Props) => {
    return (
        <div className={style.appHeader}>
            <Heading size={'xlarge'} level={'1'}>
                {cmsName}
            </Heading>
        </div>
    );
};
