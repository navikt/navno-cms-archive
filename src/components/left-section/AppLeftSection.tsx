import React from 'react';
import { AppContext } from '../../../common/appContext.ts';
import { CategoriesRoot } from './categories/CategoriesRoot.tsx';

import style from './AppLeftSection.module.css';

type Props = {
    context: AppContext;
};

export const AppLeftSection = ({ context }: Props) => {
    const { rootCategories } = context;

    return (
        <div className={style.leftMenu}>
            <CategoriesRoot rootCategories={rootCategories} />
        </div>
    );
};
