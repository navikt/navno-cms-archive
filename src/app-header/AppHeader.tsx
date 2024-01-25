import React from 'react';
import { Heading } from '@navikt/ds-react';

import style from './AppHeader.module.css';

type Props = {
    cmsName: string;
};

export const AppHeader = ({ cmsName }: Props) => {
    return (
        <Heading size={'xlarge'} level={'1'}>
            {`Arkiv - ${cmsName}`}
        </Heading>
    );
};
