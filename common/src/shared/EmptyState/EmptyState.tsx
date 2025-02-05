import React from 'react';
import { BodyShort } from '@navikt/ds-react';
import { ArrowUndoIcon } from '@navikt/aksel-icons';
import style from './EmptyState.module.css';

export const EmptyState = () => {
    return (
        <div className={style.emptyState}>
            <ArrowUndoIcon fontSize={'1.5rem'} />
            <BodyShort size={'large'}>Velg innhold i spalten til venstre</BodyShort>
        </div>
    );
};
