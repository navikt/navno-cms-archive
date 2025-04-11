import { formatTimestamp } from '@common/shared/timestamp';
import { pruneString } from '@common/shared/pruneString';
import { ContentServiceResponse } from '../../../shared/types';

const PUPPETEER_PDF_DPI = 96;
const A4_INCH_WIDTH = 8.27;
const SCALE_FACTOR = PUPPETEER_PDF_DPI * A4_INCH_WIDTH;

const MIN_SCALE = 0.1;
const MAX_SCALE = 2;

export const pixelWidthToA4Scale = (pxWidth: number) =>
    Math.max(MIN_SCALE, Math.min(MAX_SCALE, (1 / pxWidth) * SCALE_FACTOR));

export const generatePdfInfo = (content: ContentServiceResponse) => `
    <div style="font-size: 10px; margin-bottom:-16px; padding: 4px; width: 100%; display: flex; justify-content: space-between; white-space: nowrap">
        <div style="overflow-x: hidden; text-overflow: ellipsis">${pruneString(content.json.displayName, 110)}</div>
        <div>
            [Endret: ${formatTimestamp(content.json.modifiedTime)} // Versjon: ${content.json._versionKey}] - (<span class="pageNumber"></span>/<span class="totalPages"></span>)
        </div>
    </div>`;

const generateFilename = (content: ContentServiceResponse) =>
    `${content.json.modifiedTime}_${content.json.displayName}_${content.json._id}-${content.json._versionKey}`;

export const generatePdfFilename = (content: ContentServiceResponse) =>
    `${generateFilename(content)}.pdf`;

export const generateErrorFilename = (content: ContentServiceResponse) =>
    `${generateFilename(content)}.txt`;
