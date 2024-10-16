export const forceArray = <T>(arrayOrSingle: T | T[]): T[] => {
    if (Array.isArray(arrayOrSingle)) {
        return arrayOrSingle;
    }

    return [arrayOrSingle];
};
