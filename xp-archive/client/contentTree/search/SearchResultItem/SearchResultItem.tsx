import { BodyShort, Detail } from '@navikt/ds-react';
import { classNames } from '@common/client/utils/classNames';
import {
    updateContentUrl,
    getContentIconUrl,
} from 'client/contentTree/contentTreeEntry/NavigationItem';
import { useAppState } from 'client/context/appState/useAppState';
import { SearchResponse } from 'shared/types';

import style from './SearchResultItem.module.css';

export const SearchResultItem = ({
    hit,
    key,
}: {
    hit: SearchResponse['hits'][number];
    key: number;
}) => {
    const { setSelectedContentId, selectedContentId, setSelectedLocale, selectedLocale } =
        useAppState();

    return (
        <button
            className={classNames(
                style.hit,
                hit._id === selectedContentId &&
                    hit.layerLocale === selectedLocale &&
                    style.hitSelected
            )}
            key={key}
            onClick={() => {
                setSelectedContentId(hit._id);
                setSelectedLocale(hit.layerLocale);
                updateContentUrl(hit._id, hit.layerLocale);
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
                <BodyShort className={style.hitText}>{hit.displayName}</BodyShort>
                <Detail className={style.hitText}>{hit._path}</Detail>
            </div>
        </button>
    );
};
