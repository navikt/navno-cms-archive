import React from 'react';
import { CmsContentDocument } from '../../../../../common/cms-documents/content.ts';
import { Link } from '@navikt/ds-react';
import { useAppState } from '../../../../state/useAppState.tsx';
import { classNames } from '../../../../utils/classNames.ts';

import style from './FilesView.module.css';

type Props = {
    binaries: NonNullable<CmsContentDocument['binaries']>;
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
