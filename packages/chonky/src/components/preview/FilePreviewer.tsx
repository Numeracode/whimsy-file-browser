import React, { useEffect, useMemo, useState } from 'react';

import type { BrowserPreviewRenderer } from '../../types/browser-item.types';
import type {
    FilePreviewerProps,
    PreviewRendererComponent,
    PreviewRendererEntry,
    PreviewRendererModule,
    PreviewRendererProps,
    PreviewRendererRegistry,
} from '../../types/preview-shell.types';
import { PreviewFallback } from './PreviewFallback';

const imageRenderer: PreviewRendererComponent = ({ asset, item }) => (
    <img alt={item.name} data-testid="preview-image" src={asset.url} style={styles.media} />
);

const renderTracks = (asset: PreviewRendererProps['asset']) =>
    asset.tracks?.map((track) => (
        <track
            key={`${track.kind}:${track.srcLang}:${track.src}`}
            default={track.default}
            kind={track.kind}
            label={track.label}
            src={track.src}
            srcLang={track.srcLang}
        />
    ));

const videoRenderer: PreviewRendererComponent = ({ asset, item, thumbnailUrl }) => (
    <video
        controls
        data-testid="preview-video"
        poster={thumbnailUrl}
        src={asset.url}
        style={styles.media}
        title={item.name}
    >
        {renderTracks(asset)}
    </video>
);

const audioRenderer: PreviewRendererComponent = ({ asset, item }) => (
    <div data-testid="preview-audio" style={styles.audio}>
        <div style={styles.audioTitle}>{item.name}</div>
        <audio controls src={asset.url} style={styles.audioPlayer}>
            {renderTracks(asset)}
        </audio>
    </div>
);

const frameRenderer = (testId: string, titlePrefix: string): PreviewRendererComponent => ({ asset, item }) => (
    <iframe
        data-testid={testId}
        referrerPolicy="no-referrer"
        sandbox="allow-downloads allow-same-origin"
        src={asset.url}
        style={styles.frame}
        title={`${titlePrefix}: ${item.name}`}
    />
);

const lightweightDocumentRenderer = (label: string): PreviewRendererComponent => ({ asset, item }) => (
    <div data-testid="preview-document" style={styles.document}>
        <div style={styles.documentBadge}>{label}</div>
        <div style={styles.documentTitle}>{item.name}</div>
        <a href={asset.url} rel="noopener noreferrer" style={styles.documentLink} target="_blank">
            Open signed preview
        </a>
    </div>
);

export const defaultPreviewRenderers: Readonly<Record<BrowserPreviewRenderer, PreviewRendererEntry>> = {
    image: imageRenderer,
    video: videoRenderer,
    audio: audioRenderer,
    pdf: frameRenderer('preview-pdf', 'PDF preview'),
    text: frameRenderer('preview-text', 'Text preview'),
    code: frameRenderer('preview-code', 'Code preview'),
    document: {
        load: async () => lightweightDocumentRenderer('DOCX'),
        fallback: 'Loading document renderer...',
    },
    spreadsheet: {
        load: async () => lightweightDocumentRenderer('XLSX'),
        fallback: 'Loading spreadsheet renderer...',
    },
    presentation: {
        load: async () => lightweightDocumentRenderer('PPTX'),
        fallback: 'Loading presentation renderer...',
    },
    archive: lightweightDocumentRenderer('ARCHIVE'),
    none: lightweightDocumentRenderer('NO PREVIEW'),
    unknown: lightweightDocumentRenderer('FILE'),
};

const isLazyRenderer = (entry: PreviewRendererEntry): entry is Exclude<PreviewRendererEntry, PreviewRendererComponent> =>
    typeof entry !== 'function' && typeof entry.load === 'function';

const unwrapRendererModule = (module: PreviewRendererModule): PreviewRendererComponent => {
    if (typeof module === 'function') return module;
    if ('default' in module) return module.default;
    return module.PreviewRenderer;
};

const getThumbnailUrl = (props: PreviewRendererProps): string | undefined => {
    const thumbnail = props.descriptor.thumbnail;
    return thumbnail?.status === 'available' ? thumbnail.url : undefined;
};

const RendererHost: React.FC<{ entry: PreviewRendererEntry; props: PreviewRendererProps }> = ({ entry, props }) => {
    const [loadedRenderer, setLoadedRenderer] = useState<PreviewRendererComponent | null>(() =>
        isLazyRenderer(entry) ? null : entry
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        if (!isLazyRenderer(entry)) {
            setLoadedRenderer(() => entry);
            setError(null);
            return undefined;
        }

        setLoadedRenderer(null);
        setError(null);
        entry
            .load()
            .then((module) => {
                if (active) setLoadedRenderer(() => unwrapRendererModule(module));
            })
            .catch((loadError: unknown) => {
                if (!active) return;
                const message = loadError instanceof Error ? loadError.message : 'Preview renderer failed to load.';
                setError(message);
            });

        return () => {
            active = false;
        };
    }, [entry]);

    if (error) return <PreviewFallback asset={props.asset} error={error} item={props.item} />;
    if (!loadedRenderer) {
        return (
            <div data-testid="preview-renderer-loading" style={styles.loading}>
                {isLazyRenderer(entry) ? entry.fallback ?? 'Loading preview renderer...' : 'Loading preview renderer...'}
            </div>
        );
    }

    return <>{loadedRenderer({ ...props, thumbnailUrl: getThumbnailUrl(props) })}</>;
};

export const FilePreviewer: React.FC<FilePreviewerProps> = ({
    className,
    descriptor,
    item,
    onDownload,
    onRetry,
    renderers,
    style,
}) => {
    const registry = useMemo<PreviewRendererRegistry>(
        () => ({ ...defaultPreviewRenderers, ...renderers }),
        [renderers]
    );
    const asset = descriptor?.preview;

    if (!descriptor || !asset || asset.status !== 'available' || descriptor.renderer === 'none') {
        return (
            <PreviewFallback
                asset={asset}
                className={className}
                descriptor={descriptor}
                item={item}
                onDownload={onDownload}
                onRetry={onRetry}
                style={style}
            />
        );
    }

    const entry = registry[descriptor.renderer] ?? registry.unknown ?? defaultPreviewRenderers.unknown;

    return (
        <div className={className} data-preview-renderer={descriptor.renderer} data-testid="file-previewer" style={{ ...styles.root, ...style }}>
            <RendererHost entry={entry} props={{ asset, descriptor, item }} />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    root: {
        alignItems: 'stretch',
        background: '#0f172a',
        borderRadius: 12,
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        minHeight: 260,
        overflow: 'hidden',
        width: '100%',
    },
    media: {
        background: '#020617',
        height: '100%',
        maxHeight: '80vh',
        objectFit: 'contain',
        width: '100%',
    },
    frame: {
        background: '#fff',
        border: 0,
        height: 520,
        width: '100%',
    },
    audio: {
        alignItems: 'center',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        justifyContent: 'center',
        padding: 32,
        width: '100%',
    },
    audioTitle: {
        fontSize: 16,
        fontWeight: 700,
    },
    audioPlayer: {
        maxWidth: 520,
        width: '100%',
    },
    document: {
        alignItems: 'center',
        background: '#f8fafc',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        justifyContent: 'center',
        padding: 32,
        width: '100%',
    },
    documentBadge: {
        background: '#0f172a',
        borderRadius: 8,
        color: '#fff',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 1,
        padding: '8px 10px',
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: 700,
    },
    documentLink: {
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 700,
    },
    loading: {
        alignItems: 'center',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        minHeight: 260,
        width: '100%',
    },
};
