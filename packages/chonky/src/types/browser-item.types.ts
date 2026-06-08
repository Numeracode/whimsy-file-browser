export type BrowserOpaqueId = string & { readonly __brand: 'BrowserOpaqueId' };

/**
 * Marks an adapter-owned string as an opaque browser ID while preserving the
 * runtime value as a plain serializable string.
 */
export const createBrowserOpaqueId = (value: string): BrowserOpaqueId => value as BrowserOpaqueId;

export type BrowserItemKind = 'file' | 'folder';

export type BrowserSourceKind = 'private' | 'local' | 'remote' | 'connector' | 'virtual';

export interface BrowserSourceDescriptor {
    /**
     * Opaque source identifier. The browser package must not infer provider meaning
     * from this value.
     */
    id: BrowserOpaqueId;
    kind: BrowserSourceKind;
    label: string;
    accountLabel?: string;
    iconHint?: string;
    pathHint?: string;
}

export type BrowserItemRef =
    | { kind: 'catalog'; itemId: BrowserOpaqueId }
    | { kind: 'remote'; sourceId: BrowserOpaqueId; itemId: BrowserOpaqueId }
    | { kind: 'connector'; sourceId: BrowserOpaqueId; rootId: BrowserOpaqueId; itemId: BrowserOpaqueId }
    | { kind: 'local'; sourceId?: BrowserOpaqueId; itemId: BrowserOpaqueId }
    | { kind: 'custom'; namespace: string; itemId: BrowserOpaqueId };

export type BrowserPreviewRenderer =
    | 'image'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'document'
    | 'spreadsheet'
    | 'presentation'
    | 'text'
    | 'code'
    | 'archive'
    | 'none'
    | 'unknown';

export type BrowserPreviewAssetKind = 'thumbnail' | 'preview' | 'download';

export type BrowserPreviewTrackKind = 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';

export interface BrowserPreviewTrack {
    kind: BrowserPreviewTrackKind;
    src: string;
    srcLang: string;
    label: string;
    default?: boolean;
}

export type BrowserPreviewUnavailableReason =
    | 'none'
    | 'unsupported'
    | 'signing_failed'
    | 'expired'
    | 'permission_denied'
    | 'provider_unavailable'
    | 'unknown';

export type BrowserPreviewAsset<K extends BrowserPreviewAssetKind = BrowserPreviewAssetKind> =
    | {
          status: 'available';
          kind: K;
          url: string;
          expiresAt?: string;
          contentType?: string;
          tracks?: readonly BrowserPreviewTrack[];
      }
    | {
          status: 'pending';
          kind: K;
          message?: string;
          canRetry?: boolean;
      }
    | {
          status: 'unavailable';
          kind: K;
          reason: BrowserPreviewUnavailableReason;
          message?: string;
          canRetry?: boolean;
      };

export interface PreviewDescriptor {
    renderer: BrowserPreviewRenderer;
    preview?: BrowserPreviewAsset<'preview'>;
    thumbnail?: BrowserPreviewAsset<'thumbnail'>;
    download?: BrowserPreviewAsset<'download'>;
}

export interface BrowserItemCapabilities {
    open?: boolean;
    preview?: boolean;
    select?: boolean;
    drag?: boolean;
    drop?: boolean;
    rename?: boolean;
    delete?: boolean;
    download?: boolean;
    favorite?: boolean;
}

export interface BrowserItemFlags {
    disabled?: boolean;
    disabledReason?: string;
    hidden?: boolean;
    favorite?: boolean;
    encrypted?: boolean;
    symlink?: boolean;
    loading?: boolean;
}

export type BrowserMetadataValue =
    | string
    | number
    | boolean
    | null
    | readonly BrowserMetadataValue[]
    | {
          readonly [key: string]: BrowserMetadataValue;
      };

export interface BrowserItem {
    /**
     * Opaque UI identity. Adapters own the mapping from this ID to provider,
     * catalog, connector, or SDK references.
     */
    id: BrowserOpaqueId;
    kind: BrowserItemKind;
    name: string;
    ref?: BrowserItemRef;
    source?: BrowserSourceDescriptor;
    mimeType?: string;
    extension?: string;
    sizeBytes?: number;
    modifiedAt?: string;
    createdAt?: string;
    childCount?: number;
    preview?: PreviewDescriptor;
    capabilities?: BrowserItemCapabilities;
    flags?: BrowserItemFlags;
    actions?: readonly BrowserAction[];
    metadata?: Readonly<Record<string, BrowserMetadataValue>>;
}

export interface BrowserFolderChainItem {
    id: BrowserOpaqueId;
    name: string;
    ref?: BrowserItemRef;
    source?: BrowserSourceDescriptor;
    flags?: Pick<BrowserItemFlags, 'disabled' | 'disabledReason'>;
}

export type BrowserActionPlacement = 'toolbar' | 'context-menu' | 'row' | 'selection-bar';
export type BrowserActionTone = 'default' | 'primary' | 'destructive';
export type BrowserActionSelectionScope = 'none' | 'single' | 'multiple' | 'any';
export type BrowserFileOperationKind =
    | 'open'
    | 'preview'
    | 'download'
    | 'rename'
    | 'delete'
    | 'favorite'
    | 'copy'
    | 'move'
    | 'paste'
    | 'new-folder'
    | 'upload';

export interface BrowserAction {
    id: string;
    label: string;
    operation?: BrowserFileOperationKind;
    icon?: string;
    placement?: readonly BrowserActionPlacement[];
    tone?: BrowserActionTone;
    selectionScope?: BrowserActionSelectionScope;
    disabled?: boolean;
    disabledReason?: string;
    shortcut?: readonly string[];
}

export interface BrowserSelection {
    selectedIds: readonly BrowserOpaqueId[];
    focusedId?: BrowserOpaqueId;
    anchorId?: BrowserOpaqueId;
}
