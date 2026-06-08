import type { CSSProperties, ReactNode } from 'react';

import type {
    BrowserItem,
    BrowserPreviewAsset,
    BrowserPreviewRenderer,
    PreviewDescriptor,
} from './browser-item.types';

export type AvailableBrowserPreviewAsset<K extends BrowserPreviewAsset['kind'] = BrowserPreviewAsset['kind']> =
    Extract<BrowserPreviewAsset<K>, { status: 'available' }>;

export interface PreviewRequest {
    item: BrowserItem;
    reason: 'initial' | 'retry';
}

export type PreviewManifestLoader = (request: PreviewRequest) => PreviewDescriptor | Promise<PreviewDescriptor>;

export interface PreviewRendererProps {
    item: BrowserItem;
    descriptor: PreviewDescriptor;
    asset: AvailableBrowserPreviewAsset<'preview'>;
    thumbnailUrl?: string;
}

export type PreviewRendererComponent = (props: PreviewRendererProps) => ReactNode;

export type PreviewRendererModule =
    | PreviewRendererComponent
    | { default: PreviewRendererComponent }
    | { PreviewRenderer: PreviewRendererComponent };

export interface LazyPreviewRenderer {
    load: () => Promise<PreviewRendererModule>;
    fallback?: ReactNode;
}

export type PreviewRendererEntry = PreviewRendererComponent | LazyPreviewRenderer;

export type PreviewRendererRegistry = Partial<Record<BrowserPreviewRenderer, PreviewRendererEntry>>;

export interface PreviewFallbackProps {
    item: BrowserItem;
    descriptor?: PreviewDescriptor;
    asset?: BrowserPreviewAsset<'preview'>;
    error?: string;
    loading?: boolean;
    onRetry?: () => void;
    onDownload?: () => void;
    className?: string;
    style?: CSSProperties;
}

export interface PreviewTileProps {
    item: BrowserItem;
    onPreview?: (item: BrowserItem) => void;
    className?: string;
    style?: CSSProperties;
}

export interface FilePreviewerProps {
    item: BrowserItem;
    descriptor?: PreviewDescriptor;
    renderers?: PreviewRendererRegistry;
    onRetry?: () => void;
    onDownload?: () => void;
    className?: string;
    style?: CSSProperties;
}

export interface PreviewShellProps {
    item: BrowserItem;
    descriptor?: PreviewDescriptor;
    loadPreview?: PreviewManifestLoader;
    renderers?: PreviewRendererRegistry;
    autoLoad?: boolean;
    onRetry?: (item: BrowserItem) => void;
    onDownload?: (item: BrowserItem) => void;
    className?: string;
    style?: CSSProperties;
}

export interface MediaLightboxProps extends PreviewShellProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: ReactNode;
}
