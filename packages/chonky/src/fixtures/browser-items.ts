import type {
    BrowserAction,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserItemCapabilities,
    BrowserItemRef,
    BrowserPreviewAsset,
    BrowserPreviewAssetKind,
    BrowserPreviewRenderer,
    BrowserPreviewUnavailableReason,
    BrowserSelection,
    BrowserSourceDescriptor,
    PreviewDescriptor,
} from '../types/browser-item.types';

const PREVIEW_ORIGIN = 'https://preview.example.test';

const source = (descriptor: BrowserSourceDescriptor): BrowserSourceDescriptor => descriptor;

export const browserSourceFixtures: Readonly<Record<string, BrowserSourceDescriptor>> = {
    privateStorage: source({
        id: 'source:private',
        kind: 'private',
        label: 'Private storage',
        iconHint: 'lock',
        pathHint: '/files',
    }),
    localComputer: source({
        id: 'source:local',
        kind: 'local',
        label: 'This computer',
        iconHint: 'hard-drive',
        pathHint: '~/Documents',
    }),
    googleDrive: source({
        id: 'source:remote:gdrive',
        kind: 'remote',
        label: 'Design Google Drive',
        accountLabel: 'design@example.com',
        iconHint: 'google-drive',
    }),
    dropbox: source({
        id: 'source:remote:dropbox',
        kind: 'remote',
        label: 'Marketing Dropbox',
        accountLabel: 'marketing@example.com',
        iconHint: 'dropbox',
    }),
    oneDrive: source({
        id: 'source:remote:onedrive',
        kind: 'remote',
        label: 'Finance OneDrive',
        accountLabel: 'finance@example.com',
        iconHint: 'onedrive',
    }),
};

const folderCapabilities: BrowserItemCapabilities = {
    open: true,
    select: true,
    drag: true,
    drop: true,
    rename: true,
};

const previewableFileCapabilities: BrowserItemCapabilities = {
    open: true,
    preview: true,
    select: true,
    drag: true,
    download: true,
};

const unavailablePreviewFileCapabilities: BrowserItemCapabilities = {
    ...previewableFileCapabilities,
    preview: false,
};

const catalogRef = (itemId: string): BrowserItemRef => ({ kind: 'catalog', itemId });
const localRef = (sourceId: string, itemId: string): BrowserItemRef => ({ kind: 'local', sourceId, itemId });
const remoteRef = (sourceId: string, itemId: string): BrowserItemRef => ({ kind: 'remote', sourceId, itemId });

const previewUrl = (kind: BrowserPreviewAssetKind, fileName: string) =>
    `${PREVIEW_ORIGIN}/${kind === 'thumbnail' ? 'thumbs' : 'previews'}/${fileName}`;

const availableAsset = (
    kind: BrowserPreviewAssetKind,
    fileName: string,
    contentType: string
): BrowserPreviewAsset => ({
    status: 'available',
    kind,
    url: previewUrl(kind, fileName),
    contentType,
});

const pendingAsset = (kind: BrowserPreviewAssetKind, message: string): BrowserPreviewAsset => ({
    status: 'pending',
    kind,
    message,
    canRetry: true,
});

const unavailableAsset = (
    kind: BrowserPreviewAssetKind,
    reason: BrowserPreviewUnavailableReason,
    message: string,
    canRetry = false
): BrowserPreviewAsset => ({
    status: 'unavailable',
    kind,
    reason,
    message,
    canRetry,
});

const previewDescriptor = (
    renderer: BrowserPreviewRenderer,
    assets: Omit<PreviewDescriptor, 'renderer'>
): PreviewDescriptor => ({ renderer, ...assets });

const catalogFile = (item: Omit<BrowserItem, 'kind' | 'ref' | 'source'>): BrowserItem => ({
    kind: 'file',
    ref: catalogRef(item.id),
    source: browserSourceFixtures.privateStorage,
    capabilities: previewableFileCapabilities,
    ...item,
});

const remoteFile = (
    sourceDescriptor: BrowserSourceDescriptor,
    providerItemId: string,
    item: Omit<BrowserItem, 'kind' | 'ref' | 'source'>
): BrowserItem => ({
    kind: 'file',
    ref: remoteRef(sourceDescriptor.id, providerItemId),
    source: sourceDescriptor,
    capabilities: previewableFileCapabilities,
    ...item,
});

export const browserActionFixtures: readonly BrowserAction[] = [
    {
        id: 'open',
        label: 'Open',
        icon: 'open',
        placement: ['context-menu', 'row'],
        selectionScope: 'single',
    },
    {
        id: 'download',
        label: 'Download',
        icon: 'download',
        placement: ['toolbar', 'context-menu'],
        selectionScope: 'any',
    },
    {
        id: 'delete',
        label: 'Delete',
        icon: 'trash',
        placement: ['context-menu'],
        selectionScope: 'any',
        tone: 'destructive',
    },
    {
        id: 'restore-preview',
        label: 'Refresh preview',
        icon: 'refresh',
        placement: ['row', 'context-menu'],
        selectionScope: 'single',
    },
];

export const browserFolderChainFixtures: readonly BrowserFolderChainItem[] = [
    {
        id: 'folder:root',
        name: 'All files',
        ref: catalogRef('folder:root'),
        source: browserSourceFixtures.privateStorage,
    },
    {
        id: 'folder:projects',
        name: 'Projects',
        ref: catalogRef('folder:projects'),
        source: browserSourceFixtures.privateStorage,
    },
    {
        id: 'remote:gdrive:folder:campaign',
        name: 'Campaign',
        ref: remoteRef(browserSourceFixtures.googleDrive.id, 'opaque-provider-folder-id'),
        source: browserSourceFixtures.googleDrive,
    },
];

export const browserItemFixtures: readonly BrowserItem[] = [
    {
        id: 'folder:brand-assets',
        kind: 'folder',
        name: 'Brand assets',
        ref: catalogRef('folder:brand-assets'),
        source: browserSourceFixtures.privateStorage,
        childCount: 42,
        capabilities: folderCapabilities,
    },
    catalogFile({
        id: 'image:hero',
        name: 'hero-photo.jpg',
        mimeType: 'image/jpeg',
        extension: '.jpg',
        sizeBytes: 2_450_112,
        modifiedAt: '2026-06-01T14:20:00.000Z',
        preview: previewDescriptor('image', {
            thumbnail: availableAsset('thumbnail', 'hero-photo.jpg', 'image/jpeg'),
            preview: availableAsset('preview', 'hero-photo.jpg', 'image/jpeg'),
        }),
    }),
    catalogFile({
        id: 'video:walkthrough',
        name: 'walkthrough.mp4',
        mimeType: 'video/mp4',
        extension: '.mp4',
        sizeBytes: 58_900_100,
        preview: previewDescriptor('video', {
            thumbnail: availableAsset('thumbnail', 'walkthrough.jpg', 'image/jpeg'),
            preview: availableAsset('preview', 'walkthrough.mp4', 'video/mp4'),
        }),
    }),
    catalogFile({
        id: 'pdf:contract',
        name: 'contract.pdf',
        mimeType: 'application/pdf',
        extension: '.pdf',
        sizeBytes: 912_445,
        preview: previewDescriptor('pdf', {
            thumbnail: availableAsset('thumbnail', 'contract.jpg', 'image/jpeg'),
            preview: availableAsset('preview', 'contract.pdf', 'application/pdf'),
        }),
    }),
    catalogFile({
        id: 'office:proposal',
        name: 'proposal.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: '.docx',
        sizeBytes: 1_342_889,
        preview: previewDescriptor('document', {
            thumbnail: pendingAsset('thumbnail', 'Thumbnail is queued'),
            preview: availableAsset(
                'preview',
                'proposal.docx',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ),
        }),
    }),
    catalogFile({
        id: 'text:notes',
        name: 'notes.txt',
        mimeType: 'text/plain',
        extension: '.txt',
        sizeBytes: 3_120,
        preview: previewDescriptor('text', {
            preview: availableAsset('preview', 'notes.txt', 'text/plain'),
        }),
    }),
    remoteFile(browserSourceFixtures.googleDrive, 'provider-native-video-id', {
        id: 'remote:gdrive:video',
        name: 'launch-cut.mp4',
        mimeType: 'video/mp4',
        extension: '.mp4',
        preview: previewDescriptor('video', {
            thumbnail: availableAsset('thumbnail', 'launch-cut.jpg', 'image/jpeg'),
            preview: availableAsset('preview', 'launch-cut.mp4', 'video/mp4'),
        }),
    }),
    remoteFile(browserSourceFixtures.dropbox, 'provider-native-spreadsheet-id', {
        id: 'remote:dropbox:spreadsheet',
        name: 'forecast.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: '.xlsx',
        preview: previewDescriptor('spreadsheet', {
            preview: availableAsset(
                'preview',
                'forecast.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ),
        }),
    }),
    remoteFile(browserSourceFixtures.oneDrive, 'provider-native-presentation-id', {
        id: 'remote:onedrive:presentation',
        name: 'board-deck.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extension: '.pptx',
        preview: previewDescriptor('presentation', {
            preview: availableAsset(
                'preview',
                'board-deck.pptx',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ),
        }),
    }),
    {
        id: 'local:private:backup',
        kind: 'file',
        name: 'backup.zip',
        ref: localRef(browserSourceFixtures.localComputer.id, 'opaque-local-file-id'),
        source: browserSourceFixtures.localComputer,
        mimeType: 'application/zip',
        extension: '.zip',
        sizeBytes: 145_000_000,
        preview: previewDescriptor('archive', {
            preview: unavailableAsset('preview', 'unsupported', 'Archives are downloadable but not previewable'),
        }),
        capabilities: unavailablePreviewFileCapabilities,
    },
    remoteFile(browserSourceFixtures.googleDrive, 'signing-failed-id', {
        id: 'preview:signing-failed',
        name: 'restricted-video.mp4',
        mimeType: 'video/mp4',
        extension: '.mp4',
        preview: previewDescriptor('video', {
            thumbnail: unavailableAsset('thumbnail', 'signing_failed', 'Signing failed', true),
            preview: unavailableAsset('preview', 'signing_failed', 'Preview signing failed', true),
        }),
        capabilities: previewableFileCapabilities,
    }),
    catalogFile({
        id: 'preview:expired',
        name: 'expired-preview.pdf',
        mimeType: 'application/pdf',
        extension: '.pdf',
        preview: previewDescriptor('pdf', {
            thumbnail: unavailableAsset('thumbnail', 'expired', 'Thumbnail URL expired', true),
            preview: unavailableAsset('preview', 'expired', 'Preview URL expired', true),
        }),
        actions: [browserActionFixtures[3]],
        capabilities: previewableFileCapabilities,
    }),
    catalogFile({
        id: 'preview:none',
        name: 'unknown.binary',
        extension: '.binary',
        preview: previewDescriptor('none', {
            preview: unavailableAsset('preview', 'none', 'No preview is available'),
        }),
        capabilities: { ...unavailablePreviewFileCapabilities, open: false },
    }),
];

export const browserSelectionFixture: BrowserSelection = {
    selectedIds: ['image:hero', 'video:walkthrough'],
    focusedId: 'video:walkthrough',
    anchorId: 'image:hero',
};
