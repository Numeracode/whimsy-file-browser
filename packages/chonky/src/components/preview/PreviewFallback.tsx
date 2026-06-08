import React from 'react';

import type { PreviewFallbackProps } from '../../types/preview-shell.types';

const reasonLabels: Record<string, string> = {
    none: 'No preview is available.',
    unsupported: 'This file type is not previewable.',
    signing_failed: 'Signing failed.',
    expired: 'The preview link expired.',
    permission_denied: 'You do not have permission to preview this file.',
    provider_unavailable: 'The storage provider is unavailable.',
    unknown: 'Preview unavailable.',
};

const getFallbackMessage = (props: PreviewFallbackProps): string => {
    if (props.loading) return 'Loading preview...';
    if (props.error) return props.error;
    if (props.asset?.status === 'pending') return props.asset.message ?? 'Preview is being prepared.';
    if (props.asset?.status === 'unavailable') {
        return props.asset.message ?? reasonLabels[props.asset.reason] ?? reasonLabels.unknown;
    }
    if (props.descriptor?.renderer === 'archive') return reasonLabels.unsupported;
    if (props.descriptor?.renderer === 'none') return reasonLabels.none;
    return reasonLabels.unknown;
};

export const PreviewFallback: React.FC<PreviewFallbackProps> = (props) => {
    const { asset, className, item, loading, onDownload, onRetry, style } = props;
    const canRetry = Boolean(
        onRetry && (props.error || ((asset?.status === 'pending' || asset?.status === 'unavailable') && asset.canRetry))
    );
    const message = getFallbackMessage(props);

    return (
        <div className={className} data-testid="preview-fallback" style={{ ...styles.root, ...style }}>
            <div aria-hidden="true" style={styles.icon}>
                {loading ? '...' : item.extension?.replace('.', '').toUpperCase() || 'FILE'}
            </div>
            <div style={styles.title}>{item.name}</div>
            {item.source?.label ? <div style={styles.source}>{item.source.label}</div> : null}
            <div role={loading ? 'status' : undefined} style={styles.message}>
                {message}
            </div>
            <div style={styles.actions}>
                {canRetry ? (
                    <button onClick={onRetry} style={styles.button} type="button">
                        Retry preview
                    </button>
                ) : null}
                {onDownload ? (
                    <button onClick={onDownload} style={styles.button} type="button">
                        Download
                    </button>
                ) : null}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    root: {
        alignItems: 'center',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxSizing: 'border-box',
        color: '#334155',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
        minHeight: 220,
        padding: 24,
        textAlign: 'center',
        width: '100%',
    },
    icon: {
        alignItems: 'center',
        background: '#e2e8f0',
        borderRadius: 10,
        color: '#475569',
        display: 'flex',
        fontSize: 13,
        fontWeight: 700,
        height: 56,
        justifyContent: 'center',
        letterSpacing: 0.8,
        minWidth: 56,
        padding: '0 10px',
    },
    title: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: 700,
        maxWidth: '100%',
        overflowWrap: 'anywhere',
    },
    source: {
        color: '#64748b',
        fontSize: 13,
    },
    message: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 1.4,
    },
    actions: {
        display: 'flex',
        gap: 8,
        marginTop: 8,
    },
    button: {
        background: '#0f172a',
        border: 0,
        borderRadius: 8,
        color: '#fff',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 12px',
    },
};
