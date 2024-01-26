import React from 'react';
import { AppContext } from '../common/appContext.ts';
import { AppTopSection } from './top-section/AppTopSection.tsx';
import { AppLeftSection } from './left-section/AppLeftSection.tsx';
import { AppMainSection } from './main-section/AppMainSection.tsx';

import style from './App.module.css';

type Props = {
    context: AppContext;
};

export const App = ({ context }: Props) => {
    const { cmsName, rootCategories } = context;

    return (
        <div className={style.root}>
            <AppTopSection cmsName={cmsName} />
            <AppLeftSection rootCategories={rootCategories} />
            <AppMainSection />
        </div>
    );
};
