import React, { useRef, useState } from 'react';
import { Button, TextField } from '@navikt/ds-react';

import style from './AppMainContent.module.css';
import { CmsContentDocument } from '../../common/cms-documents/content.ts';

export const AppMainContent = () => {
    const [content, setContent] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className={style.mainContent}>
            <TextField
                label={'Skriv inn en contentKey'}
                type={'text'}
                size={'small'}
                htmlSize={10}
                ref={inputRef}
            />
            <Button
                size={'small'}
                onClick={(event) => {
                    const value = inputRef.current?.value;
                    fetch(`http://localhost:3399/sbs/api/content/${value}`)
                        .then((res) => {
                            if (res.ok) {
                                return res.json();
                            }

                            return res.text();
                        })
                        .then((json: CmsContentDocument) => {
                            if (!json.html) {
                                setContent('Ingen html');
                                return;
                            }

                            setContent(json.html.replace(/(\r\n|\r|\n)/, ''));
                        });
                }}
            >
                {'Hent'}
            </Button>
            {content && <iframe srcDoc={content} className={style.htmlFrame} />}
        </div>
    );
};
