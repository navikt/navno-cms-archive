import React from 'react';
import { Pagination } from '@navikt/ds-react';

import style from './Paginator.module.css';

type Props = {
    numPages: number;
    pageNumber: number;
    onPageChange: (value: number) => void;
};

export const Paginator = ({ numPages, pageNumber, onPageChange }: Props) => {
    if (numPages < 2) {
        return null;
    }

    return (
        <Pagination
            page={pageNumber}
            onPageChange={onPageChange}
            count={numPages}
            size={'xsmall'}
            className={style.paginator}
        />
    );
};
