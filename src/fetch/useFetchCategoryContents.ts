import useSWRImmutable from 'swr/immutable';
import { FetchCategoryContentsParams, useApiFetch } from './useApiFetch';

export const useFetchCategoryContents = (params: FetchCategoryContentsParams) => {
    const { fetchCategoryContents } = useApiFetch();

    const { isLoading, data, error } = useSWRImmutable(params, fetchCategoryContents);

    return { isLoading, result: data, error };
};
