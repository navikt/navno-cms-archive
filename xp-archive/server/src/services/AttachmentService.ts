import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { fetchFile } from '@common/shared/fetchUtils';
import { validateQuery } from '../utils/params';

export class AttachmentService {
    private readonly ATTACHMENT_API = xpServiceUrl('externalArchive/attachment');

    public getAttachmentHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['id', 'versionId', 'locale'])) {
            res.status(400).send('Parameters id, versionId and locale are required');
            return;
        }

        const { id, versionId, locale } = req.query;

        const attachmentResponse = await this.getAttachment(id, versionId, locale);
        if (!attachmentResponse) {
            res.status(404).send('Attachment not found');
            return;
        }

        res.status(200)
            .setHeader(
                'Content-Disposition',
                attachmentResponse.contentDisposition ||
                    `attachment; filename="${id}-${versionId}-${locale}"`
            )
            .setHeader('Content-Type', attachmentResponse.mimeType)
            .send(Buffer.from(attachmentResponse.data));
    };

    private async getAttachment(id: string, versionId: string, locale: string) {
        const response = await fetchFile(this.ATTACHMENT_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { id, versionId, locale },
        });

        return response;
    }
}
