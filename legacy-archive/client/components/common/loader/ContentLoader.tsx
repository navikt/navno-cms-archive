import React from 'react';
import { BodyShort, Loader, LoaderProps } from '@navikt/ds-react';
import { classNames } from '../../../utils/classNames';

import style from './ContentLoader.module.css';

type Props = {
    size: LoaderProps['size'];
    text: string;
    direction?: 'row' | 'column';
    className?: string;
};

export const ContentLoader = ({ size, text, direction = 'column', className }: Props) => {
    return (
        <div className={classNames(style.loader, direction === 'row' && style.row, className)}>
            <Loader size={size} />
            <BodyShort className={style.label} size={'small'}>
                {text}
            </BodyShort>
        </div>
    );
};
