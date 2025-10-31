import { getErrorMessage } from '@common/shared/fetchUtils';

export const parseAppContext = <AppContext extends Record<string, unknown>>(
    fallbackOnError: AppContext
): AppContext => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement
            ? (JSON.parse(contextElement.innerText) as AppContext)
            : fallbackOnError;
    } catch (e) {
        console.error(`Failed to parse app context - ${getErrorMessage(e)}`);
        return fallbackOnError;
    }
};
