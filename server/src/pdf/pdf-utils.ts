import { CmsContent, CmsContentDocument } from '../../../common/cms-documents/content';
import { formatTimestamp } from '../../../common/timestamp';

const PUPPETEER_PDF_DPI = 96;
const A4_INCH_WIDTH = 8.27;
const SCALE_FACTOR = PUPPETEER_PDF_DPI * A4_INCH_WIDTH;

const MIN = 0.1;
const MAX = 2;

export const pixelWidthToA4Scale = (pxWidth: number): number =>
    Math.max(MIN, Math.min(MAX, (1 / pxWidth) * SCALE_FACTOR));

export const generatePdfFooter = (content: CmsContent) => `
    <div style="font-size: 10px; margin-bottom:-16px; padding: 4px; width: 100%; display: flex; justify-content: space-between; flex-wrap: nowrap">
        <div style="white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis; flex-shrink: 1">
            ${content.displayName}
        </div>
        <div style="white-space: nowrap; flex-shrink: 0">
            [${formatTimestamp(content.meta.timestamp)} // version: ${content.versionKey}] - (<span class="pageNumber"></span>/<span class="totalPages"></span>)
        </div>
    </div>`;

export const generatePdfFilename = (content: CmsContentDocument) =>
    `${content.meta.timestamp}_${content.name}_${content.contentKey}-${content.versionKey}.pdf`;
