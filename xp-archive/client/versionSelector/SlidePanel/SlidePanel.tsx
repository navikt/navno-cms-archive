import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import style from './SlidePanel.module.css';

type SlidePanelProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const SlidePanel = ({ isOpen, onClose, children }: SlidePanelProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    return createPortal(
        <dialog
            className={style.overlay}
            open={isOpen}
            onClose={onClose}
            aria-label="Version selector"
        >
            <button
                className={style.backdrop}
                onClick={onClose}
                aria-label="Close version selector"
            />
            <div className={style.panel}>{children}</div>
        </dialog>,
        document.body
    );
};
