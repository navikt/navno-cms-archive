export const queryParams = (
    queryParam: unknown
): queryParam is string | string[] => {
    return (
        typeof queryParam === 'string' ||
        (Array.isArray(queryParam) &&
            queryParam.every((qp) => typeof qp === 'string'))
    );
};

export const parseQueryParamsList = (param: unknown): string[] | null => {
    if (typeof param !== 'string') {
        return null;
    }

    return param.split(',');
};
