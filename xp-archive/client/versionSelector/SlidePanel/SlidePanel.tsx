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
        <div className={style.overlay} onClick={onClose}>
            <div className={style.panel} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};
