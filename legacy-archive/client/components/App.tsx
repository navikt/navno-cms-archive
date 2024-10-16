import React from 'react';
import { AppContext } from '../../shared/appContext';
import { AppLeftSection } from './left-section/AppLeftSection';
import { AppMainSection } from './main-section/AppMainSection';
import { AppStateProvider } from '../context/app-state/AppStateProvider';
import { SearchStateProvider } from '../context/search-state/SearchStateProvider';
import { AppLayout } from '@common/client/AppLayout';

type Props = {
    appContext: AppContext;
};

export const App = ({ appContext }: Props) => {
    const { cmsName, basePath } = appContext;

    return (
        <AppStateProvider appContext={appContext}>
            <AppLayout siteName={cmsName} basePath={basePath}>
                <SearchStateProvider>
                    <AppLeftSection />
                </SearchStateProvider>
                <AppMainSection />
            </AppLayout>
        </AppStateProvider>
    );
};
