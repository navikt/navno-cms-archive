import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { NavigationBar } from './contentTree/NavigationBar';
import { AppStateProvider } from './context/appState/AppStateProvider';
import { ViewSelector } from './viewSelector/ViewSelector';
import { ContentView } from './contentView/ContentView';

export const App = () => {
    return (
        <AppLayout siteName={xpArchiveConfig.name} basePath={xpArchiveConfig.basePath}>
            <AppStateProvider>
                <NavigationBar />
                <ViewSelector />
                <ContentView />
            </AppStateProvider>
        </AppLayout>
    );
};
