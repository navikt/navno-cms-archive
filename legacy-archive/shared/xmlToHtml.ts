import { forceArray } from 'client/utils/forceArray';
import { parseString, parseStringPromise } from 'xml2js';
import { CmsContent } from './cms-documents/content';

type XMLToHtmlProps = {
    content: CmsContent;
    fullHtmlDocument?: boolean;
};

export type HeaderData = {
    [key: string]: string;
};

export type RowData = {
    [key: string]: string | { [key: string]: any };
};

const fullHtmlDocumentTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML to HTML</title>
    <style>.xmlTable{width:100%;border-collapse:collapse;font-family:monospace;font-size:14px}.xmlTable th{background-color:#f1f1f1;border:1px solid #ddd;padding:8px 12px;text-align:left;font-weight:600}.xmlTable td{border:1px solid #ddd;padding:8px 12px;vertical-align:top}.xmlTable tr:nth-child(even){background-color:#f9f9f9}.xmlTable tr:hover{background-color:#f5f5f5}</style>
</head>
<body>
    <h1>{{PAGE_TITLE}}</h1>
    <p>Versjon: {{GENERATED_DATE}}</p>
    {{XML_CONTENT}}
</body>
</html>`;

const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && value['has-value'] === 'false') {
        return '';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
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

const createTableFromXml = (data: any): string => {
    const contentData = data?.contents?.content?.contentdata;

    const header = contentData?.rows?.header;
    const rows = forceArray(contentData?.rows?.row);

    // Filters out the columns with actual data, to be used further down
    // to determine which header and cell to render.
    const columnsWithData = getColumnsWithData(header || {});

    return `<table class="xmlTable">
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
    const result = await parseStringPromise(content.xmlAsString, {
        explicitArray: false,
        mergeAttrs: true,
    });
    if (result.err) {
        return 'Kunne ikke parse XML: ' + result.err.message;
    }

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
};
