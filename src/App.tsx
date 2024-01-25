import React from 'react';
import { AppContext } from '../common/appContext.ts';
import { AppHeader } from './app-header/AppHeader.tsx';
import { AppLeftMenu } from './app-left-menu/AppLeftMenu.tsx';
import { AppMainContent } from './app-main-content/AppMainContent.tsx';

import style from './App.module.css';

type Props = {
    context: AppContext;
};

export const App = ({ context }: Props) => {
    const { cmsName, rootCategories } = context;

    return (
        <div className={style.root}>
            <div className={style.header}>
                <AppHeader cmsName={cmsName} />
            </div>
            <div className={style.left}>
                <AppLeftMenu rootCategories={rootCategories} />
            </div>
            <div className={style.main}>
                <AppMainContent />
            </div>
        </div>
    );
};
