export const parseAppContext = <AppContext extends Record<string, unknown>>(
    fallbackOnError: AppContext
): AppContext => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement ? JSON.parse(contextElement.innerText) : fallbackOnError;
    } catch (e) {
        console.error(`Failed to parse app context - ${e}`);
        return fallbackOnError;
    }
};
