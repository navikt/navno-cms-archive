import React from 'react';
import { Heading } from '@navikt/ds-react';

type Props = {
    cmsName: string
}

export const AppHeader = ({ cmsName }: Props) => {
    return <Heading size={'xlarge'} level={'1'}>{cmsName}</Heading>;
};