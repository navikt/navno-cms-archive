import { CmsContentDocument } from '../../../common/cms-documents/content';

export const sortContents = (contents?: CmsContentDocument[] | null) =>
    contents?.sort((a, b) => (a.displayName > b.displayName ? 1 : -1)) || null;

export const sortVersions = (content: CmsContentDocument) =>
    content.versions.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
