import { fetchJson } from '@common/shared/fetchJson';
import { ContentIconResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';

export class ContentIconService {
    private readonly CONTENT_ICON_API = xpServiceUrl('externalArchive/contentIcon');

    public getContentIcon(type: string) {
        return this.fetchContentIcon(type);
    }

    private async fetchContentIcon(type: string) {
        const response = await fetch(`${this.CONTENT_ICON_API}?type=${type}`, {
            headers: { secret: process.env.SERVICE_SECRET },
        });

        return response;
    }
}
