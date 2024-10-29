import React, { useCallback, useState } from 'react';
import { AppStateContext } from './AppStateContext';

type Props = {
    children: React.ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContentId, setSelectedContentId] = useState<string>();
    const [selectedVersionId, setSelectedVersionId] = useState<string>();

    const updateSelectedContent = useCallback(
        (selectedContentId: string | undefined, selectedVersionId?: string) => {
            setSelectedVersionId(selectedVersionId);
            if (selectedContentId) {
                setSelectedContentId(selectedContentId);
            }
        },
        []
    );

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId,
                selectedVersionId,
                updateSelectedContent,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
