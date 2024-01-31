import React, { useEffect, useState } from 'react';
import { CategoriesMenu } from './categories/CategoriesMenu';
import { ContentsMenu } from './contents/ContentsMenu';
import { useAppState } from '../../state/useAppState';
import { classNames } from '../../utils/classNames';

import style from './AppLeftSection.module.css';

export const AppLeftSection = () => {
    const [contentSelectorOpen, setContentSelectorOpen] = useState(false);

    const { selectedCategory, setSelectedCategory, appContext } = useAppState();
    const { rootCategories } = appContext;

    useEffect(() => {
        if (selectedCategory) {
            setContentSelectorOpen(true);
        } else {
            setContentSelectorOpen(false);
        }
    }, [selectedCategory]);

    return (
        <div className={style.leftMenu}>
            <CategoriesMenu rootCategories={rootCategories} />
            <div
                className={classNames(
                    style.contentsMenuWrapper,
                    contentSelectorOpen && style.open
                )}
            >
                {selectedCategory && (
                    <ContentsMenu
                        parentCategory={selectedCategory}
                        close={() => setSelectedCategory(null)}
                    />
                )}
            </div>
        </div>
    );
};
