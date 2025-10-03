import React, { useState, useEffect } from 'react';
import { parseString } from 'xml2js';
import { Alert, Switch, Tooltip } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';

import style from './XmlAsTableView.module.css';
import { forceArray } from 'client/utils/forceArray';

type Props = {
    xml: string;
    hidden?: boolean;
};

type HeaderData = {
    [key: string]: string;
};

type RowData = {
    [key: string]: string | { [key: string]: any };
};

export const XmlAsTableView = ({ xml, hidden }: Props) => {
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (xml) {
            parseString(xml, { explicitArray: false, mergeAttrs: true }, (err, result) => {
                if (err) {
                    setError('Failed to parse XML: ' + err.message);
                    setParsedData(null);
                } else {
                    setError(null);
                    setParsedData(result);
                }
            });
        }
    }, [xml]);

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

    const renderTable = () => {
        if (!parsedData) return null;

        const contentData = parsedData?.contents?.content?.contentdata;

        const header = contentData?.rows?.header;
        const rows = forceArray(contentData?.rows?.row);

        // Filters out the columns with actual data, to be used further down
        // to determine which header and cell to render.
        const columnsWithData = getColumnsWithData(header || {});

        return (
            <table className={style.xmlTable}>
                <thead>
                    <tr>
                        {Object.entries(header || {}).map(
                            ([key, value]) =>
                                columnsWithData.includes(key) && <th key={key}>{String(value)}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {Object.entries(row).map(([key, value]) =>
                                columnsWithData.includes(key) ? (
                                    <td key={key}>{renderValue(value)}</td>
                                ) : null
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className={classNames(style.container, hidden && style.hidden)}>
            {error ? <Alert variant="error">{error}</Alert> : renderTable()}
        </div>
    );
};
