import React from 'react';
import { Label, Loader, LoaderProps } from '@navikt/ds-react';
import { classNames } from '../../../utils/classNames';

import style from './ContentLoader.module.css';

type Props = {
    size: LoaderProps['size'];
    text: string;
    className?: string;
};

export const ContentLoader = ({ size, text, className }: Props) => {
    return (
        <div className={classNames(style.loader, className)}>
            <Loader size={size} />
            <Label>{text}</Label>
        </div>
    );
};
