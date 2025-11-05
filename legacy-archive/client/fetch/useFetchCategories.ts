import useSWRImmutable from 'swr/immutable';
import { useApiFetch } from './useApiFetch';
import { CmsCategoryListItem } from '../../shared/cms-documents/category';

export const useFetchCategories = (categoryKeys: string[]) => {
    const { fetchCategories } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable<CmsCategoryListItem[] | null, Error>(
        categoryKeys,
        fetchCategories
    );

    return { isLoading, categories: data, error };
};
