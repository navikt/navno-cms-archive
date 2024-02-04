import {
    QueryDslQueryContainer,
    SearchRequest,
    SearchSort,
} from '@opensearch-project/opensearch/api/types';
import { ContentSearchParams, ContentSearchSort } from '../../../../common/contentSearch';
import { Request } from 'express';
import { parseNumberParam, parseToStringArray } from '../../utils/queryParams';
import { CmsArchiveCategoriesService } from '../../cms/CmsArchiveCategoriesService';

const SIZE_DEFAULT = 50;

const sortParamsSet: ReadonlySet<ContentSearchSort> = new Set(['name', 'datetime', 'score']);

const isValidSort = (sort: string): sort is ContentSearchSort =>
    sortParamsSet.has(sort as ContentSearchSort);

const sortParams: Record<ContentSearchSort, SearchSort> = {
    score: {
        _score: 'desc',
    },
    datetime: {
        'meta.timestamp': 'desc',
    },
    name: {
        name: 'asc',
    },
} as const;

export const transformQueryToContentSearchParams = (req: Request): ContentSearchParams | null => {
    const { query, withContent, size, sort, from, categoryKeys, withChildCategories } =
        req.query as Record<keyof ContentSearchParams, string>;

    return {
        query,
        withContent: withContent === 'true',
        categoryKeys: parseToStringArray(categoryKeys),
        withChildCategories: withChildCategories === 'true',
        sort: isValidSort(sort) ? sort : 'score',
        from: parseNumberParam(from) ?? 0,
        size: parseNumberParam(size) ?? SIZE_DEFAULT,
    };
};

const includedFields = ['contentKey', 'versionKey', 'displayName', 'category.key'];

export const buildContentSearchParams = (
    contentSearchParams: ContentSearchParams,
    categoriesService: CmsArchiveCategoriesService
): SearchRequest => {
    const {
        query,
        from,
        size,
        sort = 'score',
        withContent,
        categoryKeys,
        withChildCategories,
    } = contentSearchParams;

    const must: QueryDslQueryContainer[] = [
        {
            term: {
                isCurrentVersion: {
                    value: true,
                },
            },
        },
    ];

    if (query) {
        const fields = ['displayName^10'];

        if (withContent) {
            fields.push('xmlAsString');
        }

        must.push({
            multi_match: {
                query,
                fields,
                type: 'phrase_prefix',
            },
        });
    }

    if (categoryKeys) {
        const categoryKeysFinal = [...categoryKeys];

        if (withChildCategories) {
            const childCategoryKeys = categoryKeys.flatMap((key) =>
                categoriesService.getDescendantCategories(key)
            );
            categoryKeysFinal.push(...childCategoryKeys);
        }

        must.push({
            terms: {
                'category.key': categoryKeysFinal,
            },
        });
    }

    return {
        from,
        size,
        _source_includes: includedFields,
        body: {
            track_total_hits: true,
            sort: sortParams[sort],
            query: {
                bool: {
                    must,
                },
            },
        },
    };
};
