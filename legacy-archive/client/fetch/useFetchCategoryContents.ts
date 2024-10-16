import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';
import { ContentSearchParams } from '../../shared/contentSearch';

type FetchCategoryContentsParams = {
    categoryKey: string;
    from: number;
    size: number;
    query?: string;
};

export const useFetchCategoryContents = ({
    from,
    size,
    query,
    categoryKey,
}: FetchCategoryContentsParams) => {
    const { fetchSearch } = useApiFetch();

    const params: ContentSearchParams = {
        from,
        size,
        query,
        categoryKeys: [categoryKey],
        type: 'all',
    };

    const { isLoading, data, error } = useSWRImmutable(params, fetchSearch);

    return { isLoading, result: data, error };
};
