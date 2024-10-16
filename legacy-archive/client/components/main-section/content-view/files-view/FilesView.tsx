import React from 'react';
import { CmsContent } from '../../../../../shared/cms-documents/content';
import { Link } from '@navikt/ds-react';
import { useAppState } from '../../../../context/app-state/useAppState';
import { classNames } from '../../../../utils/classNames';

import style from './FilesView.module.css';

type Props = {
    binaries: NonNullable<CmsContent['binaries']>;
    hidden: boolean;
};

export const FilesView = ({ binaries, hidden }: Props) => {
    const { appContext } = useAppState();

    return (
        <div className={classNames(style.files, hidden && style.hidden)}>
            {binaries.map((binary) => (
                <Link
                    key={binary.key}
                    href={`${appContext.basePath}/binary/file/${binary.key}`}
                    target={'_blank'}
                >{`${binary.filename} (${(binary.filesize / 1000).toFixed(2)} kB)`}</Link>
            ))}
        </div>
    );
};
