import React from 'react';
import { BodyShort, Detail } from '@navikt/ds-react';
import { classNames } from '@common/client/utils/classNames';
import { getContentIconUrl } from 'client/contentTree/contentTreeEntry/NavigationItem';
import { useAppState } from 'client/context/appState/useAppState';
import { SearchResponse } from 'shared/types';

import style from './SearchResultItem.module.css';

export const SearchResultItem = ({ hit }: { hit: SearchResponse['hits'][number] }) => {
    const { updateSelectedContent, selectedContentId, selectedLocale } = useAppState();

    return (
        <button
            className={classNames(
                style.hit,
                hit._id === selectedContentId &&
                    hit.layerLocale === selectedLocale &&
                    style.hitSelected
            )}
            onClick={() => {
                updateSelectedContent({
                    contentId: hit._id,
                    locale: hit.layerLocale,
                    versionId: undefined,
                });
            }}
        >
            <img
                src={getContentIconUrl(hit.type)}
                width={32}
                height={32}
                style={{ marginRight: '5px' }}
                alt={''}
            />
            <div className={style.hitTextWrapper}>
                <div className={style.textAndLanguage}>
                    <BodyShort className={style.hitText} truncate>
                        {hit.displayName}
                    </BodyShort>
                    {hit.language ? (
                        <span className={style.languageTag}>{hit.language}</span>
                    ) : null}
                </div>

                <Detail className={style.hitText}>{hit._path}</Detail>
            </div>
        </button>
    );
};
