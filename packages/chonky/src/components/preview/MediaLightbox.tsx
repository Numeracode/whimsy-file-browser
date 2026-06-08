import React, { KeyboardEvent, useEffect, useRef } from 'react';

import type { MediaLightboxProps } from '../../types/preview-shell.types';
import { PreviewShell } from './PreviewShell';

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ onOpenChange, open, title, ...previewProps }) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (open) closeButtonRef.current?.focus();
    }, [open]);

    if (!open) return null;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onOpenChange(false);
            return;
        }

        if (event.key !== 'Tab') return;
        const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
                'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
            ) ?? []
        ).filter((element) => !element.hasAttribute('disabled'));
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    return (
        <div
            aria-label={typeof title === 'string' ? title : previewProps.item.name}
            aria-modal="true"
            data-testid="media-lightbox"
            onKeyDown={handleKeyDown}
            role="dialog"
            style={styles.backdrop}
        >
            <div ref={dialogRef} style={styles.dialog}>
                <div style={styles.header}>
                    <div style={styles.title}>{title ?? previewProps.item.name}</div>
                    <button
                        aria-label="Close preview"
                        onClick={() => onOpenChange(false)}
                        ref={closeButtonRef}
                        style={styles.closeButton}
                        type="button"
                    >
                        ×
                    </button>
                </div>
                <PreviewShell {...previewProps} style={{ ...styles.preview, ...previewProps.style }} />
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.74)',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        padding: 24,
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 1000,
    },
    dialog: {
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        maxWidth: 1120,
        overflow: 'hidden',
        width: '100%',
    },
    header: {
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
    },
    title: {
        color: '#0f172a',
        fontSize: 15,
        fontWeight: 700,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    closeButton: {
        background: '#f1f5f9',
        border: 0,
        borderRadius: 8,
        color: '#0f172a',
        cursor: 'pointer',
        fontSize: 22,
        height: 44,
        lineHeight: '40px',
        width: 44,
    },
    preview: {
        borderRadius: 0,
        minHeight: 420,
    },
};
