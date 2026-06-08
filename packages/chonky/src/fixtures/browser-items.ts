import { createBrowserOpaqueId } from '../types/browser-item.types';
import type {
    BrowserAction,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserItemCapabilities,
    BrowserItemRef,
    BrowserOpaqueId,
    BrowserPreviewAsset,
    BrowserPreviewAssetKind,
    BrowserPreviewRenderer,
    BrowserPreviewUnavailableReason,
    BrowserSelection,
    BrowserSourceDescriptor,
    PreviewDescriptor,
} from '../types/browser-item.types';
import { BROWSER_FILE_OPERATION_ACTIONS } from '../util/browser-file-operations';

const PREVIEW_ORIGIN = 'https://preview.example.test';

const opaqueId = createBrowserOpaqueId;
const source = (descriptor: BrowserSourceDescriptor): BrowserSourceDescriptor => descriptor;

export const browserSourceFixtures: Readonly<Record<string, BrowserSourceDescriptor>> = {
    privateStorage: source({
        id: opaqueId('source:private'),
        kind: 'private',
        label: 'Private storage',
        iconHint: 'lock',
        pathHint: '/files',
    }),
    localComputer: source({
        id: opaqueId('source:local'),
        kind: 'local',
        label: 'This computer',
        iconHint: 'hard-drive',
        pathHint: '~/Documents',
    }),
    googleDrive: source({
        id: opaqueId('source:remote:gdrive'),
        kind: 'remote',
        label: 'Design Google Drive',
        accountLabel: 'design@example.com',
        iconHint: 'google-drive',
    }),
    dropbox: source({
        id: opaqueId('source:remote:dropbox'),
        kind: 'remote',
        label: 'Marketing Dropbox',
        accountLabel: 'marketing@example.com',
        iconHint: 'dropbox',
    }),
    oneDrive: source({
        id: opaqueId('source:remote:onedrive'),
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
    delete: true,
};

const previewableFileCapabilities: BrowserItemCapabilities = {
    open: true,
    preview: true,
    select: true,
    drag: true,
    download: true,
    rename: true,
    delete: true,
    favorite: true,
};

const unavailablePreviewFileCapabilities: BrowserItemCapabilities = {
    ...previewableFileCapabilities,
    preview: false,
};

const catalogRef = (itemId: string): BrowserItemRef => ({ kind: 'catalog', itemId: opaqueId(itemId) });
const localRef = (sourceId: BrowserOpaqueId, itemId: string): BrowserItemRef => ({
    kind: 'local',
    sourceId,
    itemId: opaqueId(itemId),
});
const remoteRef = (sourceId: BrowserOpaqueId, itemId: string): BrowserItemRef => ({
    kind: 'remote',
    sourceId,
    itemId: opaqueId(itemId),
});

const previewUrl = (kind: BrowserPreviewAssetKind, fileName: string) =>
    `${PREVIEW_ORIGIN}/${kind === 'thumbnail' ? 'thumbs' : 'previews'}/${fileName}`;

const availableAsset = <K extends BrowserPreviewAssetKind>(
    kind: K,
    fileName: string,
    contentType: string
): BrowserPreviewAsset<K> => ({
    status: 'available',
    kind,
    url: previewUrl(kind, fileName),
    contentType,
});

const pendingAsset = <K extends BrowserPreviewAssetKind>(kind: K, message: string): BrowserPreviewAsset<K> => ({
    status: 'pending',
    kind,
    message,
    canRetry: true,
});

const unavailableAsset = <K extends BrowserPreviewAssetKind>(
    kind: K,
    reason: BrowserPreviewUnavailableReason,
    message: string,
    canRetry = false
): BrowserPreviewAsset<K> => ({
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

const catalogFile = (item: Omit<BrowserItem, 'kind' | 'ref' | 'source' | 'id'> & { id: string }): BrowserItem => ({
    kind: 'file',
    ref: catalogRef(item.id),
    source: browserSourceFixtures.privateStorage,
    capabilities: previewableFileCapabilities,
    ...item,
    id: opaqueId(item.id),
});

const remoteFile = (
    sourceDescriptor: BrowserSourceDescriptor,
    providerItemId: string,
    item: Omit<BrowserItem, 'kind' | 'ref' | 'source' | 'id'> & { id: string }
): BrowserItem => ({
    kind: 'file',
    ref: remoteRef(sourceDescriptor.id, providerItemId),
    source: sourceDescriptor,
    capabilities: previewableFileCapabilities,
    ...item,
    id: opaqueId(item.id),
});

export const browserActionFixtures: readonly BrowserAction[] = BROWSER_FILE_OPERATION_ACTIONS;

export const browserFolderChainFixtures: readonly BrowserFolderChainItem[] = [
    {
        id: opaqueId('folder:root'),
        name: 'All files',
        ref: catalogRef('folder:root'),
        source: browserSourceFixtures.privateStorage,
    },
    {
        id: opaqueId('folder:projects'),
        name: 'Projects',
        ref: catalogRef('folder:projects'),
        source: browserSourceFixtures.privateStorage,
    },
    {
        id: opaqueId('remote:gdrive:folder:campaign'),
        name: 'Campaign',
        ref: remoteRef(browserSourceFixtures.googleDrive.id, 'opaque-provider-folder-id'),
        source: browserSourceFixtures.googleDrive,
    },
];

export const browserItemFixtures: readonly BrowserItem[] = [
    {
        id: opaqueId('folder:brand-assets'),
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
    catalogFile({
        id: 'code:component',
        name: 'PreviewShell.tsx',
        mimeType: 'text/tsx',
        extension: '.tsx',
        sizeBytes: 8_420,
        preview: previewDescriptor('code', {
            preview: availableAsset('preview', 'PreviewShell.tsx', 'text/tsx'),
        }),
    }),
    catalogFile({
        id: 'audio:jingle',
        name: 'launch-jingle.mp3',
        mimeType: 'audio/mpeg',
        extension: '.mp3',
        sizeBytes: 4_120_100,
        preview: previewDescriptor('audio', {
            preview: availableAsset('preview', 'launch-jingle.mp3', 'audio/mpeg'),
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
        id: opaqueId('local:private:backup'),
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
        actions: [{
            id: 'restore-preview',
            label: 'Refresh preview',
            icon: 'refresh',
            placement: ['row', 'context-menu'],
            selectionScope: 'single',
        }],
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
    selectedIds: [opaqueId('image:hero'), opaqueId('video:walkthrough')],
    focusedId: opaqueId('video:walkthrough'),
    anchorId: opaqueId('image:hero'),
};
