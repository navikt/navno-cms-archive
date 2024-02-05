import React from 'react';
import { AppContext } from '../../common/appContext';
import { AppTopSection } from './top-section/AppTopSection';
import { AppLeftSection } from './left-section/AppLeftSection';
import { AppMainSection } from './main-section/AppMainSection';
import { AppStateProvider } from '../state/useAppState';

import style from './App.module.css';

type Props = {
    appContext: AppContext;
};

export const App = ({ appContext }: Props) => {
    const { cmsName } = appContext;

    return (
        <AppStateProvider appContext={appContext}>
            <div className={style.root}>
                <AppTopSection cmsName={cmsName} />
                <AppLeftSection />
                <AppMainSection />
            </div>
        </AppStateProvider>
    );
};
