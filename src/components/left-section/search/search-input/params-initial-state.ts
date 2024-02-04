import { ContentSearchParams } from '../../../../../common/contentSearch';
import Cookies from 'js-cookie';

const getCookieKey = (basePath: string) => `cms-archive-search-settings${basePath}`;

const initialParamsRequired: ContentSearchParams = {
    from: 0,
    size: 50,
    withChildCategories: true,
} as const;

export const getInitialSearchParams = (basePath: string): ContentSearchParams => {
    const cookieValue = Cookies.get(getCookieKey(basePath));

    if (cookieValue) {
        try {
            const parsed = JSON.parse(cookieValue);

            return {
                ...parsed,
                ...initialParamsRequired,
            };
        } catch (e) {
            console.error(`Failed to parse search params from cookie - ${e}`);
        }
    }

    return initialParamsRequired;
};

export const persistSearchParams = (params: ContentSearchParams, basePath: string) => {
    Cookies.set(getCookieKey(basePath), JSON.stringify(params), {
        expires: 365,
    });
};
