import React, { useState } from 'react';
import { AppStateContext } from './AppStateContext';

type Props = {
    contentId?: string;
    children: React.ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
    const [contentId, setContentId] = useState<string>();

    return (
        <AppStateContext.Provider value={{ contentId, setContentId }}>
            {children}
        </AppStateContext.Provider>
    );
};
