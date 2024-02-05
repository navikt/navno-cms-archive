import { ContentSearchParams } from '../../../../../common/contentSearch';
import Cookies from 'js-cookie';
import { initialSearchParams } from '../../../../state/useSearchState';

const getCookieKey = (basePath: string) => `cms-archive-search-settings${basePath}`;

export const getInitialSearchParams = (basePath: string): ContentSearchParams => {
    const cookieValue = Cookies.get(getCookieKey(basePath));

    if (cookieValue) {
        try {
            const parsed = JSON.parse(cookieValue);

            return {
                ...parsed,
                ...initialSearchParams,
            };
        } catch (e) {
            console.error(`Failed to parse search params from cookie - ${e}`);
        }
    }

    return initialSearchParams;
};

export const persistSearchParams = (params: ContentSearchParams, basePath: string) => {
    Cookies.set(getCookieKey(basePath), JSON.stringify(params), {
        expires: 365,
    });
};
