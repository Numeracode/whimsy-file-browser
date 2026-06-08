export type BrowserOpaqueId = string;

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

export type BrowserPreviewUnavailableReason =
    | 'none'
    | 'unsupported'
    | 'signing_failed'
    | 'expired'
    | 'permission_denied'
    | 'provider_unavailable'
    | 'unknown';

export type BrowserPreviewAsset =
    | {
          status: 'available';
          kind: BrowserPreviewAssetKind;
          url: string;
          expiresAt?: string;
          contentType?: string;
      }
    | {
          status: 'pending';
          kind: BrowserPreviewAssetKind;
          message?: string;
          canRetry?: boolean;
      }
    | {
          status: 'unavailable';
          kind: BrowserPreviewAssetKind;
          reason: BrowserPreviewUnavailableReason;
          message?: string;
          canRetry?: boolean;
      };

export interface PreviewDescriptor {
    renderer: BrowserPreviewRenderer;
    preview?: BrowserPreviewAsset;
    thumbnail?: BrowserPreviewAsset;
    download?: BrowserPreviewAsset;
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

export interface BrowserAction {
    id: string;
    label: string;
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
