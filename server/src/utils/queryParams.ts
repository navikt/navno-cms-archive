export const parseQueryParamsList = (param: unknown): string[] | null => {
    if (typeof param !== 'string') {
        return null;
    }

    return param.split(',');
};

export const parseNumberParam = (value: unknown): number | undefined => {
    return Number(value) || undefined;
};
