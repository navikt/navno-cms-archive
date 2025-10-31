import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';
import { CmsContent } from '../../shared/cms-documents/content';

export const useFetchContent = (contentKey: string) => {
    const { fetchContent } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable<CmsContent | null, Error>(
        contentKey,
        fetchContent
    );

    return { isLoading, content: data, error };
};
