import React from 'react';
import { Alert, BodyLong } from '@navikt/ds-react';
import { AppContext } from '../common/types/appContext.ts';

import style from './App.module.css';

type Props = {
    context: AppContext
}

export const App = ({ context }: Props) => {
    return (
        <div className={style.appRoot}>
            {context.rootCategories.map(category => {
                return <BodyLong>{category.title}</BodyLong>;
            })}
        </div>
    );
};
