import { ContentSearchParams } from '../../../shared/contentSearch';
import Cookies from 'js-cookie';
import { initialSearchParams } from './SearchStateContext';
import { getErrorMessage } from '@common/shared/fetchUtils';

const getCookieKey = (basePath: string) => `cms-archive-search-settings${basePath}`;

export const getInitialSearchParams = (basePath: string): ContentSearchParams => {
    const cookieValue = Cookies.get(getCookieKey(basePath));

    if (cookieValue) {
        try {
            return {
                ...(JSON.parse(cookieValue) as ContentSearchParams),
                ...initialSearchParams,
            };
        } catch (e) {
            console.error(`Failed to parse search params from cookie - ${getErrorMessage(e)}`);
        }
    }

    return initialSearchParams;
};

export const persistSearchParams = (params: ContentSearchParams, basePath: string) => {
    Cookies.set(getCookieKey(basePath), JSON.stringify(params), {
        expires: 365,
    });
};
