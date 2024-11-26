import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { NavigationBar } from './contentTree/NavigationBar';
import { Content } from './content/Content';
import { AppStateProvider } from './context/appState/AppStateProvider';

export const App = () => {
    return (
        <AppLayout basePath={xpArchiveConfig.basePath} showUnderDevAlert>
            <AppStateProvider>
                <NavigationBar />
                <Content />
            </AppStateProvider>
        </AppLayout>
    );
};
