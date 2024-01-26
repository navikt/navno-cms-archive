import React, { useRef, useState } from 'react';
import { Button, TextField } from '@navikt/ds-react';
import { CmsContentDocument } from '../../common/cms-documents/content.ts';
import { ContentView } from './content-view/ContentView.tsx';

import style from './AppMainSection.module.css';

export const AppMainSection = () => {
    const [content, setContent] = useState<CmsContentDocument | null>(null);
    const versionInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={style.mainContent}>
            <div className={style.buttons}>
                <TextField
                    label={'Skriv inn en versionKey'}
                    type={'text'}
                    size={'small'}
                    htmlSize={15}
                    ref={versionInputRef}
                />
                <Button
                    size={'small'}
                    onClick={(event) => {
                        const value = versionInputRef.current?.value;
                        fetch(`http://localhost:3399/sbs/api/version/${value}`)
                            .then((res) => {
                                if (res.ok) {
                                    return res.json();
                                }

                                return null;
                            })
                            .then((json: CmsContentDocument) => {
                                setContent(json);
                            });
                    }}
                >
                    {'Hent'}
                </Button>
            </div>
            {content && <ContentView content={content} />}
        </div>
    );
};
