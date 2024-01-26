import React from 'react';
import { Heading } from '@navikt/ds-react';

import style from './AppTopSection.module.css';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    return (
        <div className={style.top}>
            <Heading size={'xlarge'} level={'1'}>
                {`Arkiv - ${cmsName}`}
            </Heading>
        </div>
    );
};
