import React from 'react';
import { CmsCategoryDocument } from '../../common/cms-documents/category.ts';
import { BodyLong } from '@navikt/ds-react';

import style from './AppLeftMenu.module.css';

type Props = {
    rootCategories: CmsCategoryDocument[];
};

export const AppLeftMenu = ({ rootCategories }: Props) => {
    return (
        <div className={style.leftMenu}>
            {rootCategories.map((category) => {
                return <BodyLong key={category.key}>{category.title}</BodyLong>;
            })}
        </div>
    );
};
