import React from 'react';
import { CmsContentDocument } from '../../../common/cms-documents/content.ts';

import style from './ContentView.module.css';

type Props = { content: CmsContentDocument };

export const ContentView = ({ content }: Props) => {
    const { html } = content;

    return html ? (
        <iframe
            srcDoc={html
                .replace(/(\r\n|\r|\n)/, '')
                .replace(/src="\/(\d)+\//g, 'src="/sbs/')
                .replace(/href="\/(\d)+\//g, 'href="/sbs/')}
            className={style.htmlFrame}
        />
    ) : (
        <div className={style.noHtml}>{'Innholdet har ingen HTML'}</div>
    );
};
