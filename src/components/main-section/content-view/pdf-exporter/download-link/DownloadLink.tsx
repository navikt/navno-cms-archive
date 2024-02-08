import React, { useState } from 'react';
import { Link, Loader } from '@navikt/ds-react';
import { classNames } from '../../../../../utils/classNames';
import Cookies from 'js-cookie';
import { DOWNLOAD_COOKIE_NAME } from '../../../../../../common/downloadCookie';

import style from './DownloadLink.module.css';

type Props = {
    href: string;
    small?: boolean;
    icon?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    children: React.ReactNode;
};

export const DownloadLink = ({ href, small, icon, disabled, className, children }: Props) => {
    const [isWaiting, setIsWaiting] = useState(false);

    const onDownload = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        Cookies.remove(DOWNLOAD_COOKIE_NAME);
        setIsWaiting(true);

        const interval = setInterval(() => {
            const cookieValue = Cookies.get(DOWNLOAD_COOKIE_NAME);
            if (cookieValue) {
                clearInterval(interval);
                clearTimeout(timeout);
                setIsWaiting(false);
            }
        }, 200);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setIsWaiting(false);
        }, 10000);
    };

    return (
        <Link
            href={href}
            download={true}
            className={classNames(
                style.link,
                small && style.small,
                (isWaiting || disabled) && style.disabled,
                className
            )}
            onClick={onDownload}
        >
            {children}
            <div className={style.iconContainer}>
                {isWaiting ? <Loader size={'small'} /> : icon}
            </div>
        </Link>
    );
};
