import style from './App.module.css';

import React from 'react';
import { AppContext } from '../common/types/appContext.ts';
import { AppHeader } from './app-header/AppHeader.tsx';
import { AppLeftMenu } from './app-left-menu/AppLeftMenu.tsx';
import { AppMainContent } from './app-main-content/AppMainContent.tsx';

type Props = {
    context: AppContext
}

export const App = ({ context }: Props) => {
    const { cmsName, rootCategories } = context;

    return (
        <div className={style.appRoot}>
            <AppHeader cmsName={cmsName} />
            <AppLeftMenu rootCategories={rootCategories} />
            <AppMainContent />
        </div>
    );
};
