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
            console.log('Value is not a string');
            return undefined;
        }

        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
            console.log('Parsed value is an array');
            return parsed.map((item) => item.toString());
        }

        console.log(`Parsed value is something else: ${typeof parsed}`);
        return [parsed];
    } catch (e) {
        console.error(`Error parsing value: ${e}`);
        return undefined;
    }
};
