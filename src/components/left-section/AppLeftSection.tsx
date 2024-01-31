import React from 'react';
import { CategoriesMenu } from './categories/CategoriesMenu';
import { ContentsMenu } from './contents/ContentsMenu';
import { useAppState } from '../../state/useAppState';
import { classNames } from '../../utils/classNames';

import style from './AppLeftSection.module.css';

export const AppLeftSection = () => {
    const { selectedCategory, appContext, contentSelectorOpen } = useAppState();
    const { rootCategories } = appContext;

    return (
        <div className={style.leftSection}>
            <div className={classNames(style.categoriesMenu, contentSelectorOpen && style.hidden)}>
                <CategoriesMenu rootCategories={rootCategories} />
            </div>
            <div className={classNames(style.contentsMenu, contentSelectorOpen && style.open)}>
                {selectedCategory && <ContentsMenu parentCategory={selectedCategory} />}
            </div>
        </div>
    );
};
