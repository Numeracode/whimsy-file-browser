import React from 'react';

import type { PreviewTileProps } from '../../types/preview-shell.types';

export const PreviewTile: React.FC<PreviewTileProps> = ({ className, item, onPreview, style }) => {
    const thumbnail = item.preview?.thumbnail;
    const canPreview = item.kind === 'file' && item.capabilities?.preview !== false && item.preview?.renderer !== 'none';
    const label = item.preview?.renderer ?? item.extension?.replace('.', '').toUpperCase() ?? item.kind;

    return (
        <button
            aria-label={`Preview ${item.name}`}
            className={className}
            data-preview-status={thumbnail?.status ?? 'missing'}
            data-testid="preview-tile"
            disabled={!canPreview}
            onClick={() => {
                if (canPreview) onPreview?.(item);
            }}
            style={{ ...styles.root, ...style }}
            type="button"
        >
            {thumbnail?.status === 'available' ? (
                <img alt="" src={thumbnail.url} style={styles.image} />
            ) : (
                <span aria-hidden="true" style={styles.fallback}>
                    {label}
                </span>
            )}
            <span style={styles.name}>{item.name}</span>
        </button>
    );
};

const styles: Record<string, React.CSSProperties> = {
    root: {
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        color: '#0f172a',
        cursor: 'pointer',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 128,
        padding: 10,
        width: 144,
    },
    image: {
        borderRadius: 8,
        height: 88,
        objectFit: 'cover',
        width: '100%',
    },
    fallback: {
        alignItems: 'center',
        background: '#f1f5f9',
        borderRadius: 8,
        color: '#475569',
        display: 'flex',
        fontSize: 12,
        fontWeight: 700,
        height: 88,
        justifyContent: 'center',
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        width: '100%',
    },
    name: {
        fontSize: 12,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};
