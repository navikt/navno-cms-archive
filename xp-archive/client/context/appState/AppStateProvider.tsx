import React, { useState } from 'react';
import { AppStateContext } from './AppStateContext';

type Props = {
    children: React.ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContentId, setSelectedContentId] = useState<string>();
    const [selectedVersionId, setSelectedVersionId] = useState<string>();

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId,
                setSelectedContentId,
                selectedVersionId,
                setSelectedVersionId,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
