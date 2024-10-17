import { fetchJson } from '@common/shared/fetchJson';

type ConstructorProps = {
    xpServiceUrl: string;
};

export class ContentService {
    private readonly SITECONTENT_API: string;
    private readonly SITECONTENT_VERSIONS_API: string;

    constructor({ xpServiceUrl }: ConstructorProps) {
        this.SITECONTENT_API = `${xpServiceUrl}/sitecontent`;
        this.SITECONTENT_VERSIONS_API = `${xpServiceUrl}/sitecontentVersions`;
    }

    public getCurrentContent(id: string, locale = 'no') {
        const response = fetchJson(this.SITECONTENT_API, {
            headers: { secret: 'dummyToken' },
            params: { id, locale, branch: 'draft' },
        });

        return response;
    }
}
