import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';

export const App = () => {
    return (
        <AppLayout siteName={xpArchiveConfig.name} basePath={xpArchiveConfig.basePath}>
            <div>{'Hello world!'}</div>
        </AppLayout>
    );
};
