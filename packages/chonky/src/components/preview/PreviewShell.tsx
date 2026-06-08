import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { PreviewDescriptor } from '../../types/browser-item.types';
import type { PreviewShellProps } from '../../types/preview-shell.types';
import { FilePreviewer } from './FilePreviewer';
import { PreviewFallback } from './PreviewFallback';

export const PreviewShell: React.FC<PreviewShellProps> = ({
    autoLoad = true,
    className,
    descriptor,
    item,
    loadPreview,
    onDownload,
    onRetry,
    renderers,
    style,
}) => {
    const [resolvedDescriptor, setResolvedDescriptor] = useState<PreviewDescriptor | undefined>(
        descriptor ?? item.preview
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        requestIdRef.current += 1;
        setResolvedDescriptor(descriptor ?? item.preview);
        setError(null);
        setLoading(false);
    }, [descriptor, item.id, item.preview]);

    const requestPreview = useCallback(
        async (reason: 'initial' | 'retry') => {
            if (!loadPreview) return;
            requestIdRef.current += 1;
            const requestId = requestIdRef.current;
            const requestedItemId = item.id;
            setLoading(true);
            setError(null);
            try {
                const nextDescriptor = await loadPreview({ item, reason });
                if (requestId !== requestIdRef.current || requestedItemId !== item.id) return;
                setResolvedDescriptor(nextDescriptor);
            } catch (loadError) {
                if (requestId !== requestIdRef.current || requestedItemId !== item.id) return;
                const message = loadError instanceof Error ? loadError.message : 'Preview manifest failed to load.';
                setError(message);
            } finally {
                if (requestId === requestIdRef.current && requestedItemId === item.id) setLoading(false);
            }
        },
        [item, loadPreview]
    );

    useEffect(() => {
        if (autoLoad && !resolvedDescriptor && loadPreview) {
            void requestPreview('initial');
        }
    }, [autoLoad, loadPreview, requestPreview, resolvedDescriptor]);

    const retry = useCallback(() => {
        onRetry?.(item);
        if (loadPreview) void requestPreview('retry');
    }, [item, loadPreview, onRetry, requestPreview]);

    const download = useCallback(() => {
        onDownload?.(item);
    }, [item, onDownload]);

    if (loading && !resolvedDescriptor) {
        return <PreviewFallback className={className} error={error ?? undefined} item={item} loading style={style} />;
    }

    if (error && !resolvedDescriptor) {
        return (
            <PreviewFallback
                className={className}
                error={error}
                item={item}
                onDownload={onDownload ? download : undefined}
                onRetry={loadPreview || onRetry ? retry : undefined}
                style={style}
            />
        );
    }

    return (
        <FilePreviewer
            className={className}
            descriptor={resolvedDescriptor}
            item={item}
            onDownload={onDownload ? download : undefined}
            onRetry={loadPreview || onRetry ? retry : undefined}
            renderers={renderers}
            style={style}
        />
    );
};
