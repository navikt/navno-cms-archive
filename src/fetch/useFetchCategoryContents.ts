import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

export const useFetchCategoryContents = (categoryKey: string) => {
    const { fetchCategoryContents } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(categoryKey, fetchCategoryContents);

    return { isLoading, contents: data, error };
};
