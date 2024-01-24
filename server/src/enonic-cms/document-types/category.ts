type ContentRefData = {
    key: string,
    name: string,
    displayName: string,
    timestamp?: string,
}

type CategoryRefData = {
    key: string,
    name: string,
}

export type CmsCategoryDocument = {
    xmlAsstring: string,

    key: string,
    title: string,

    contentTypeKey?: string,
    superKey?: string,

    categories?: CategoryRefData[],
    contents?: ContentRefData[]
}
