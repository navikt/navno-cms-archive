export type OS_Document = Record<string, unknown>

export type OS_SearchHit<Document extends Record<string, unknown>> = {
    _index: string,
    _id: string,
    _score: number,
    _source: Document
}

export type OS_SearchResult<Document extends Record<string, unknown>> = {
    took: number,
    timed_out: boolean,
    _shards: {
        'total': number,
        'successful': number,
        'skipped': number,
        'failed': number
    },
    hits: {
        total: {
            value: number,
            relation: string,
        }
        max_score: number,
        hits: OS_SearchHit<Document>[]
    }
}