import { Request } from 'express';

export const validateQuery = <RequiredKeys extends string, OptionalKeys extends string>(
    query: Request['query'],
    requiredKeys: RequiredKeys[],
    optionalKeys: OptionalKeys[] = []
): query is Record<RequiredKeys, string> &
    Record<OptionalKeys, string | undefined> &
    Request['query'] => {
    const validatedRequiredKeys = requiredKeys.every((key) => typeof query[key] === 'string');
    const validatedOptionalKeys = optionalKeys.every(
        (key) => !query[key] || typeof query[key] === 'string'
    );

    return validatedRequiredKeys && validatedOptionalKeys;
};
