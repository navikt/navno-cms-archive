import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';
import { CmsContent } from '../../shared/cms-documents/content';

export const useFetchContentVersion = (versionKey?: string) => {
    const { fetchContentVersion } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable<CmsContent | null, Error>(
        versionKey,
        fetchContentVersion
    );

    return { isLoading, contentVersion: data, error };
};
