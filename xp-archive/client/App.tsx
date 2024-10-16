import React from 'react';
import { AppLayout } from '@common/client/AppLayout';

export const App = () => {
    return (
        <AppLayout siteName={'xp'} basePath={'/xp'}>
            <div>{'Hello world!'}</div>
        </AppLayout>
    );
};
