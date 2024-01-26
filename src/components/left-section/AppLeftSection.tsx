import React from 'react';
import { CmsCategoryDocument } from '../../../common/cms-documents/category.ts';
import { BodyLong } from '@navikt/ds-react';

import style from './AppLeftSection.module.css';

type Props = {
    rootCategories: CmsCategoryDocument[];
};

export const AppLeftSection = ({ rootCategories }: Props) => {
    return (
        <div className={style.leftMenu}>
            {rootCategories.map((category) => {
                return <BodyLong key={category.key}>{category.title}</BodyLong>;
            })}
        </div>
    );
};
