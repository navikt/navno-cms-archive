export type CmsBinaryDocument = {
    binaryKey: string,
    contentKey: string,
    versionKeys: string[],

    filename: string,
    filesize: number,

    data: string
}