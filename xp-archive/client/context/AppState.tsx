import React, { createContext, useContext, useState } from 'react';

type State = {
    contentId: string | null;
    setContentId: (contentId: string) => void;
};

const AppContext = createContext<State>({ contentId: null, setContentId: () => ({}) });

export const useAppState = () => {
    const { contentId, setContentId } = useContext(AppContext);

    return {
        contentId,
        setContentId,
    };
};

type Props = {
    children: React.ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
    const [contentId, setContentId] = useState<string | null>(null);

    return (
        <AppContext.Provider value={{ contentId, setContentId }}>{children}</AppContext.Provider>
    );
};
