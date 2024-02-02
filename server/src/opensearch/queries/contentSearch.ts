import {
    QueryDslQueryContainer,
    SearchRequest,
    SearchSort,
} from '@opensearch-project/opensearch/api/types';
import { ContentSearchParams, ContentSearchSort } from '../../../../common/contentSearch';
import { Request } from 'express';
import { parseNumberParam } from '../../utils/queryParams';

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
    const { query, fullQuery, size, sort, from, categoryKey } = req.query as Record<string, string>;

    return {
        query,
        fullQuery: fullQuery === 'true',
        categoryKey,
        sort: isValidSort(sort) ? sort : 'score',
        from: parseNumberParam(from) ?? 0,
        size: parseNumberParam(size) ?? SIZE_DEFAULT,
    };
};

const includedFields = ['contentKey', 'versionKey', 'displayName', 'category.key'];

export const buildContentSearchParams = (
    contentSearchParams: ContentSearchParams
): SearchRequest => {
    const { query, from, size, sort = 'score', fullQuery, categoryKey } = contentSearchParams;

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

        if (fullQuery) {
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

    if (categoryKey) {
        must.push({
            term: {
                'category.key': categoryKey,
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
