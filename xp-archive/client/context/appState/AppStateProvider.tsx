import React, { useCallback, useState } from 'react';
import { AppStateContext } from './AppStateContext';

type Props = {
    children: React.ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContentId, setSelectedContentId] = useState<string>();
    const [selectedVersionId, setSelectedVersionId] = useState<string>();

    const updateSelectedContentId = useCallback((selectedContentId: string) => {
        setSelectedVersionId(undefined);
        setSelectedContentId(selectedContentId);
    }, []);
    const setSelectedVersionIdMemoized = useCallback(setSelectedVersionId, [setSelectedVersionId]);

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId,
                setSelectedContentId: updateSelectedContentId,
                selectedVersionId,
                setSelectedVersionId: setSelectedVersionIdMemoized,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
