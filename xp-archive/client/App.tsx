import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { AppStateProvider } from './context/appState/AppStateProvider';
import { Content } from './content/Content';
import { SideView } from './sideView/SideView';

export const App = () => {
    return (
        <AppLayout basePath={xpArchiveConfig.basePath}>
            <AppStateProvider>
                <SideView />
                <Content />
            </AppStateProvider>
        </AppLayout>
    );
};
