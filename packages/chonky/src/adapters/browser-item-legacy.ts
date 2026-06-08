import type {
    BrowserFolderChainItem,
    BrowserItem,
    BrowserPreviewAsset,
} from '../types/browser-item.types';
import type { FileArray, FileData } from '../types/file.types';

export interface BrowserItemFileData extends FileData {
    browserItem: BrowserItem;
    browserItemRef?: BrowserItem['ref'];
    browserSourceLabel?: string;
    browserPreviewRenderer?: BrowserItem['preview'] extends infer Preview
        ? Preview extends { renderer: infer Renderer }
            ? Renderer
            : never
        : never;
    browserPreviewStatus?: BrowserPreviewAsset['status'];
}

export interface BrowserFolderChainFileData extends FileData {
    browserFolderChainItem: BrowserFolderChainItem;
    browserItemRef?: BrowserFolderChainItem['ref'];
    browserSourceLabel?: string;
}

const getPrimaryPreviewAsset = (item: BrowserItem): BrowserPreviewAsset | undefined =>
    item.preview?.preview ?? item.preview?.thumbnail ?? item.preview?.download;

export const getBrowserItemThumbnailUrl = (item: BrowserItem): string | null => {
    const thumbnail = item.preview?.thumbnail;
    return thumbnail?.status === 'available' ? thumbnail.url : null;
};

/**
 * Transitional bridge for the B1/W1 spikes. The new Whimsy-facing BrowserItem
 * contract is canonical, while today's renderer still consumes legacy FileData.
 */
export const adaptBrowserItemToFileData = (item: BrowserItem): BrowserItemFileData => {
    const primaryPreview = getPrimaryPreviewAsset(item);
    const disabled = item.flags?.disabled === true;

    return {
        id: item.id,
        name: item.name,
        ext: item.extension,
        isDir: item.kind === 'folder',
        isHidden: item.flags?.hidden,
        isSymlink: item.flags?.symlink,
        isEncrypted: item.flags?.encrypted,
        openable: disabled ? false : item.capabilities?.open,
        selectable: disabled ? false : item.capabilities?.select,
        draggable: disabled ? false : item.capabilities?.drag,
        droppable: disabled ? false : item.capabilities?.drop,
        dndOpenable: disabled ? false : item.kind === 'folder' ? item.capabilities?.open : false,
        size: item.sizeBytes,
        modDate: item.modifiedAt,
        childrenCount: item.childCount,
        thumbnailUrl: getBrowserItemThumbnailUrl(item) ?? undefined,
        browserItem: item,
        browserItemRef: item.ref,
        browserSourceLabel: item.source?.label,
        browserPreviewRenderer: item.preview?.renderer,
        browserPreviewStatus: primaryPreview?.status,
    };
};

export const adaptBrowserItemsToFileArray = (
    items: readonly BrowserItem[]
): FileArray<BrowserItemFileData> => items.map(adaptBrowserItemToFileData);

export const adaptBrowserFolderChainToFileArray = (
    folderChain: readonly BrowserFolderChainItem[]
): FileArray<BrowserFolderChainFileData> =>
    folderChain.map((folder) => ({
        id: folder.id,
        name: folder.name,
        isDir: true,
        openable: !folder.flags?.disabled,
        selectable: false,
        draggable: false,
        droppable: false,
        browserFolderChainItem: folder,
        browserItemRef: folder.ref,
        browserSourceLabel: folder.source?.label,
    }));

export const browserItemThumbnailGenerator = (file: FileData): string | null => {
    const browserItem = (file as Partial<BrowserItemFileData>).browserItem;
    return browserItem ? getBrowserItemThumbnailUrl(browserItem) : file.thumbnailUrl ?? null;
};
