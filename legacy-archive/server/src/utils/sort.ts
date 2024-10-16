import { CmsContentDocument } from '../../../shared/cms-documents/content';

export const sortVersions = (content: CmsContentDocument) =>
    content.versions.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
