import React from 'react';

import type { MediaLightboxProps } from '../../types/preview-shell.types';
import { PreviewShell } from './PreviewShell';

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ onOpenChange, open, title, ...previewProps }) => {
    if (!open) return null;

    return (
        <div aria-modal="true" data-testid="media-lightbox" role="dialog" style={styles.backdrop}>
            <div style={styles.dialog}>
                <div style={styles.header}>
                    <div style={styles.title}>{title ?? previewProps.item.name}</div>
                    <button
                        aria-label="Close preview"
                        onClick={() => onOpenChange(false)}
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
        height: 34,
        lineHeight: '30px',
        width: 34,
    },
    preview: {
        borderRadius: 0,
        minHeight: 420,
    },
};
