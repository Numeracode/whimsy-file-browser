import { GenericFileActionHandler, MapFileActionsToData } from './types/action-handler.types';
import { ChonkyActionUnion } from './types/file-browser.types';

export { FileBrowser } from './components/external/FileBrowser';
export { FileNavbar } from './components/external/FileNavbar';
export { FileToolbar } from './components/external/FileToolbar';
export { FileList } from './components/file-list/FileList';
export { FileContextMenu } from './components/external/FileContextMenu';
export { FullFileBrowser } from './components/external/FullFileBrowser';
export { BrowserShell } from './components/browser-shell/BrowserShell';
export { BrowserDestinationPicker, BrowserFolderTree } from './components/tree/BrowserFolderTree';
export { FilePreviewer, defaultPreviewRenderers } from './components/preview/FilePreviewer';
export { MediaLightbox } from './components/preview/MediaLightbox';
export { PreviewFallback } from './components/preview/PreviewFallback';
export { PreviewShell } from './components/preview/PreviewShell';
export { PreviewTile } from './components/preview/PreviewTile';

export { ChonkyActions, DefaultFileActions, OptionIds } from './action-definitions';
export { defineFileAction } from './util/helpers';

export { FileHelper } from './util/file-helper';
export { FileData, FileArray } from './types/file.types';
export { FileAction, FileActionEffect, FileSelectionTransform, FileActionButton, CustomVisibilityState } from './types/action.types';
export {
    GenericFileActionHandler,
    MapFileActionsToData,
    FileActionData,
    FileActionState,
} from './types/action-handler.types';
export { ChonkyActionUnion } from './types/file-browser.types';
export { ChonkyIconName } from './types/icons.types';
export type ChonkyIconProps = import('./types/icons.types').ChonkyIconProps;
export { FileBrowserHandle, FileBrowserProps } from './types/file-browser.types';
export { FileViewMode } from './types/file-view.types';
export type FileViewConfig = import('./types/file-view.types').FileViewConfig;
export type FileViewConfigGrid = import('./types/file-view.types').FileViewConfigGrid;
export type FileViewConfigList = import('./types/file-view.types').FileViewConfigList;
export { ThumbnailGenerator } from './types/thumbnails.types';
export { createBrowserOpaqueId } from './types/browser-item.types';
export type {
    BrowserAction,
    BrowserActionPlacement,
    BrowserActionSelectionScope,
    BrowserActionTone,
    BrowserFileOperationKind,
    BrowserFolderChainItem,
    BrowserItem,
    BrowserItemCapabilities,
    BrowserItemFlags,
    BrowserItemKind,
    BrowserItemRef,
    BrowserMetadataValue,
    BrowserOpaqueId,
    BrowserPreviewAsset,
    BrowserPreviewAssetKind,
    BrowserPreviewRenderer,
    BrowserPreviewTrack,
    BrowserPreviewTrackKind,
    BrowserPreviewUnavailableReason,
    BrowserSelection,
    BrowserSourceDescriptor,
    BrowserSourceKind,
    PreviewDescriptor,
} from './types/browser-item.types';
export type {
    BrowserShellActionEvent,
    BrowserShellContextMenuRenderProps,
    BrowserShellItemEvent,
    BrowserShellNavigateEvent,
    BrowserShellProps,
    BrowserShellToolbarRenderProps,
    BrowserSortDirection,
    BrowserSortKey,
    BrowserSortState,
    BrowserViewMode,
} from './types/browser-shell.types';
export type {
    BrowserFileOperationEvent,
} from './types/browser-operation.types';
export type {
    BrowserDestinationPickerProps,
    BrowserFolderChildrenLoader,
    BrowserFolderExpansionEvent,
    BrowserFolderSelectionEvent,
    BrowserFolderTreeNode,
    BrowserFolderTreeProps,
} from './types/browser-tree.types';
export type {
    BrowserDropTargetKind,
    BrowserTransferDropSnapshot,
    BrowserTransferIntent,
    BrowserTransferModifierState,
    BrowserTransferOperation,
    BrowserTransferSourceSnapshot,
    BrowserTransferTarget,
} from './types/browser-transfer.types';
export {
    BROWSER_FILE_OPERATION_ACTIONS,
    createBrowserFileOperationEvent,
    fileOperationForAction,
    isBrowserActionEnabled,
    isSelectionScopeSatisfied,
    selectedItemsForOperation,
} from './util/browser-file-operations';
export {
    createBrowserTransferIntent,
    resolveBrowserTransferOperation,
} from './util/browser-transfer';
export type {
    AvailableBrowserPreviewAsset,
    FilePreviewerProps,
    LazyPreviewRenderer,
    MediaLightboxProps,
    PreviewFallbackProps,
    PreviewManifestLoader,
    PreviewRendererComponent,
    PreviewRendererEntry,
    PreviewRendererModule,
    PreviewRendererProps,
    PreviewRendererRegistry,
    PreviewRequest,
    PreviewShellProps,
    PreviewTileProps,
} from './types/preview-shell.types';
export {
    browserActionFixtures,
    browserFolderChainFixtures,
    browserItemFixtures,
    browserSelectionFixture,
    browserSourceFixtures,
} from './fixtures/browser-items';
export {
    browserFolderTreeFixtures,
    lazyBrowserFolderChildrenFixtures,
} from './fixtures/browser-tree';
export {
    adaptBrowserFolderChainToFileArray,
    adaptBrowserItemToFileData,
    adaptBrowserItemsToFileArray,
    browserItemThumbnailGenerator,
    getBrowserItemThumbnailUrl,
} from './adapters/browser-item-legacy';
export type {
    BrowserFolderChainFileData,
    BrowserItemFileData,
} from './adapters/browser-item-legacy';

export { I18nConfig, ChonkyFormatters } from './types/i18n.types';
export { defaultFormatters, getI18nId, getActionI18nId, I18nNamespace } from './util/i18n';

export { setChonkyDefaults } from './util/default-config';

export { ChonkyDndFileEntryType } from './types/dnd.types';
export type ChonkyDndFileEntryItem = import('./types/dnd.types').ChonkyDndFileEntryItem;

export type FileActionHandler = GenericFileActionHandler<ChonkyActionUnion>;
export type ChonkyFileActionData = MapFileActionsToData<ChonkyActionUnion>;

// Extensions
export * from './extensions';

// Redux/Store
export * from './redux/reducers';
export * from './redux/store';
export * from './redux/selectors';
export { thunkDispatchFileAction, thunkRequestFileAction } from './redux/thunks/dispatchers.thunks';
