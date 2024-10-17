import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { NavigationBar } from './contentTree/NavigationBar';
import { ContentView } from './contentView/ContentView';
import { AppStateProvider } from './context/appState/AppStateProvider';

export const App = () => {
    return (
        <AppLayout siteName={xpArchiveConfig.name} basePath={xpArchiveConfig.basePath}>
            <AppStateProvider>
                <NavigationBar />
                <ContentView />
            </AppStateProvider>
        </AppLayout>
    );
};
