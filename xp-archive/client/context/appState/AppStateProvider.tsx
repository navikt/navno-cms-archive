import React, { useCallback, useMemo, useState } from 'react';
import { AppStateContext } from './AppStateContext';

type Props = {
    children: React.ReactNode;
};

export type SelectedVersion = {
    versionId: string;
    nodeId?: string;
};

export const AppStateProvider = ({ children }: Props) => {
    const [selectedContentId, setSelectedContentId] = useState<string>();
    const [selectedVersion, setSelectedVersion] = useState<SelectedVersion>();

    const setSelectedContentIdMemoized = useCallback(setSelectedContentId, [setSelectedContentId]);
    const setSelectedVersionMemoized = useCallback(setSelectedVersion, [setSelectedVersion]);
    const selectedVersionMemoized = useMemo(() => selectedVersion, [selectedVersion]);

    return (
        <AppStateContext.Provider
            value={{
                selectedContentId,
                setSelectedContentId: setSelectedContentIdMemoized,
                selectedVersion: selectedVersionMemoized,
                setSelectedVersion: setSelectedVersionMemoized,
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
};
