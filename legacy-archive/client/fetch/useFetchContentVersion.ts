import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

export const useFetchContentVersion = (versionKey?: string) => {
    const { fetchContentVersion } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(versionKey, fetchContentVersion);

    return { isLoading, contentVersion: data, error };
};
