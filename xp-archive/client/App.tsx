import React from 'react';
import { AppLayout } from '@common/client/AppLayout';
import { xpArchiveConfig } from '@common/shared/siteConfigs';
import { ContentTree } from './contentTree/ContentTree';

export const App = () => {
    return (
        <AppLayout siteName={xpArchiveConfig.name} basePath={xpArchiveConfig.basePath}>
            <ContentTree />
            <div>{'Innhold goes here'}</div>
        </AppLayout>
    );
};
