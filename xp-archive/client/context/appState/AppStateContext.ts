import { createContext } from 'react';

type State = {
    contentId?: string;
    setContentId: (contentId: string) => void;
};

export const AppStateContext = createContext<State>({ setContentId: () => ({}) });
