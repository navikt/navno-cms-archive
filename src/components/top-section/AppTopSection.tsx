import React from 'react';
import { Heading, Link } from '@navikt/ds-react';

import style from './AppTopSection.module.css';
import { useAppState } from '../../state/useAppState.tsx';

type Props = {
    cmsName: string;
};

export const AppTopSection = ({ cmsName }: Props) => {
    const { appContext } = useAppState();

    const otherCms = appContext.basePath === '/sbs' ? 'fss' : 'sbs';

    return (
        <div className={style.top}>
            <Heading size={'xlarge'} level={'1'}>
                {`Arkiv - ${cmsName}`}
            </Heading>
            <Link href={`/${otherCms}`}>{`Til ${otherCms.toUpperCase()}`}</Link>
        </div>
    );
};
