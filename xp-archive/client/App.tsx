import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { NavigationBar } from './contentTree/NavigationBar';
import { ContentView } from './contentView/ContentView';
import { AppContextProvider } from './context/AppState';

export const App = () => {
    return (
        <AppLayout siteName={xpArchiveConfig.name} basePath={xpArchiveConfig.basePath}>
            <AppContextProvider>
                <NavigationBar />
                <ContentView />
            </AppContextProvider>
        </AppLayout>
    );
};
