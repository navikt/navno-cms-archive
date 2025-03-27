import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { AppStateProvider } from './context/appState/AppStateProvider';
import { AppDataComponent } from './appDataComponent/AppDataComponent';

export const App = () => {
    return (
        <AppLayout basePath={xpArchiveConfig.basePath} showUnderDevAlert>
            <AppStateProvider>
                <AppDataComponent />
            </AppStateProvider>
        </AppLayout>
    );
};
