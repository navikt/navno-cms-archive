import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

export const useFetchCategoryContents = (categoryKey: string, from: number, size: number) => {
    const { fetchCategoryContents } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(
        { categoryKey, from, size },
        fetchCategoryContents
    );

    return { isLoading, contents: data, error };
};
