import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

export const useFetchContent = (contentKey: string) => {
    const { fetchContent } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(contentKey, fetchContent);

    return { isLoading, content: data, error };
};
