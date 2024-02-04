export const parseQueryParamsList = (param: unknown): string[] | null => {
    if (typeof param !== 'string') {
        return null;
    }

    return param.split(',');
};

export const parseNumberParam = (value: unknown): number | undefined => {
    return Number(value) || undefined;
};

export const parseToStringArray = (value: unknown): string[] | undefined => {
    try {
        if (typeof value !== 'string') {
            return undefined;
        }

        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
            return parsed.map((item) => item.toString());
        }

        return [parsed.toString()];
    } catch (e) {
        return undefined;
    }
};
