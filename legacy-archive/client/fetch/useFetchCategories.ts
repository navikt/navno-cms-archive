import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';

export const useFetchCategories = (categoryKeys: string[]) => {
    const { fetchCategories } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(categoryKeys, fetchCategories);

    return { isLoading, categories: data, error };
};
