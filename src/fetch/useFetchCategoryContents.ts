import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

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

    const params = {
        from,
        size,
        query,
        categoryKeys: [categoryKey],
    };

    const { isLoading, data, error } = useSWRImmutable(params, fetchSearch);

    return { isLoading, result: data, error };
};
