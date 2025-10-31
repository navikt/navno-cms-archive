import { forceArray } from 'client/utils/forceArray';
import { parseStringPromise } from 'xml2js';
import { CmsContent } from './cms-documents/content';
import { getErrorMessage } from '@common/shared/fetchUtils';

type XMLToHtmlProps = {
    content: CmsContent;
    fullHtmlDocument?: boolean;
};

export type HeaderData = {
    [key: string]: string;
};

export type RowData = {
    [key: string]: string | { [key: string]: unknown };
};

const fullHtmlDocumentTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML to HTML</title>
</head>
<body>
    <h1>{{PAGE_TITLE}}</h1>
    <p>Versjon: {{GENERATED_DATE}}</p>
    {{XML_CONTENT}}
</body>
</html>`;

const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (
        typeof value === 'object' &&
        value &&
        'has-value' in value &&
        value['has-value'] === 'false'
    ) {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
};

// All XML has 13 columns, but some are empty. Normally, the columns are
// filled from left to right, but to make sure no data is missed, loop over all
// columns. This function assumes that if header is empty, then the data is empty as well.
const getColumnsWithData = (header: HeaderData) => {
    return header
        ? Object.entries(header)
              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
              .map(([key]) => key)
        : [];
};

const createTableFromXml = (data: unknown): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const dataRecord = data as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const contentData = dataRecord?.contents?.content?.contentdata;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const header = contentData?.rows?.header as HeaderData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const rows = forceArray(contentData?.rows?.row) as RowData[];

    // Filters out the columns with actual data, to be used further down
    // to determine which header and cell to render.
    const columnsWithData = getColumnsWithData(header || {});

    return `<style>.xmlTable{width:100%;border-collapse:collapse;font-family:monospace;font-size:14px}.xmlTable th{background-color:#f1f1f1;border:1px solid #ddd;padding:8px 12px;text-align:left;font-weight:600}.xmlTable td{border:1px solid #ddd;padding:8px 12px;vertical-align:top}.xmlTable tr:nth-child(even){background-color:#f9f9f9}.xmlTable tr:hover{background-color:#f5f5f5}</style>
            <table class="xmlTable">
                <thead>
                    <tr>
                        ${Object.entries(header || {})
                            .map(([key, value]) =>
                                columnsWithData.includes(key) ? `<th>${String(value)}</th>` : ''
                            )
                            .join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows
                        .map(
                            (row) =>
                                `<tr>
                            ${Object.entries(row)
                                .map(([key, value]) =>
                                    columnsWithData.includes(key)
                                        ? `<td>${renderValue(value)}</td>`
                                        : ''
                                )
                                .join('')}
                        </tr>`
                        )
                        .join('')}
                </tbody>
            </table>`;
};

export const xmlToHtml = async ({
    content,
    fullHtmlDocument,
}: XMLToHtmlProps): Promise<string | null> => {
    if (!content?.xmlAsString) {
        return null;
    }

    try {
        const result = (await parseStringPromise(content.xmlAsString, {
            explicitArray: false,
            mergeAttrs: true,
        })) as unknown;

        const htmlTable = createTableFromXml(result);

        if (fullHtmlDocument) {
            return fullHtmlDocumentTemplate
                .replace('{{XML_CONTENT}}', htmlTable)
                .replace('{{PAGE_TITLE}}', content.displayName || 'Ukjent sidenavn')
                .replace(
                    '{{GENERATED_DATE}}',
                    content.meta.timestamp
                        ? new Date(content.meta.timestamp).toLocaleString('no-NO')
                        : 'Unknown'
                );
        }

        return htmlTable;
    } catch (err) {
        return 'Kunne ikke parse XML: ' + getErrorMessage(err);
    }
};
