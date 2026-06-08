import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

vi.mock('react-virtualized-auto-sizer', () => ({
    default: ({ children }: { children: (size: { width: number; height: number }) => React.ReactNode }) =>
        children({ width: 1024, height: 720 }),
}));

import {
    adaptBrowserFolderChainToFileArray,
    adaptBrowserItemToFileData,
    adaptBrowserItemsToFileArray,
    browserFolderChainFixtures,
    browserItemFixtures,
    browserItemThumbnailGenerator,
    ChonkyActions,
    createBrowserOpaqueId,
    FullFileBrowser,
} from '../src';
import type { BrowserItem } from '../src';

describe('BrowserItem render bridge spike', () => {
    it('maps the canonical BrowserItem contract into legacy FileData without losing opaque identity', () => {
        const hero = browserItemFixtures.find((item) => item.id === 'image:hero');

        expect(hero).toBeDefined();
        const file = adaptBrowserItemToFileData(hero!);

        expect(file.id).toBe(hero!.id);
        expect(file.name).toBe('hero-photo.jpg');
        expect(file.ext).toBe('.jpg');
        expect(file.thumbnailUrl).toBe('https://preview.example.test/thumbs/hero-photo.jpg');
        expect(file.browserItem).toBe(hero);
        expect(file.browserItemRef).toEqual(hero!.ref);
        expect(file.browserSourceLabel).toBe('Private storage');
        expect(file.browserPreviewRenderer).toBe('image');
        expect(file.browserPreviewStatus).toBe('available');
    });

    it('preserves preview failure states while withholding invalid thumbnails', () => {
        const signingFailed = browserItemFixtures.find((item) => item.id === 'preview:signing-failed');

        expect(signingFailed).toBeDefined();
        const file = adaptBrowserItemToFileData(signingFailed!);

        expect(file.thumbnailUrl).toBeUndefined();
        expect(file.browserPreviewRenderer).toBe('video');
        expect(file.browserPreviewStatus).toBe('unavailable');
        expect(file.browserItem.preview?.preview?.status).toBe('unavailable');
        expect(file.browserItem.preview?.preview).toMatchObject({
            reason: 'signing_failed',
            canRetry: true,
        });
    });

    it('forces disabled BrowserItems to be non-interactive in the legacy renderer', () => {
        const hero = browserItemFixtures.find((item) => item.id === 'image:hero');

        expect(hero).toBeDefined();
        const disabledItem: BrowserItem = {
            ...hero!,
            id: createBrowserOpaqueId('disabled:image:hero'),
            flags: { ...hero!.flags, disabled: true },
            capabilities: {
                open: true,
                preview: true,
                select: true,
                drag: true,
                drop: true,
            },
        };

        const file = adaptBrowserItemToFileData(disabledItem);

        expect(file.openable).toBe(false);
        expect(file.selectable).toBe(false);
        expect(file.draggable).toBe(false);
        expect(file.droppable).toBe(false);
        expect(file.dndOpenable).toBe(false);
    });

    it('maps folder chain fixtures into legacy folder chain entries', () => {
        const folderChain = adaptBrowserFolderChainToFileArray(browserFolderChainFixtures);

        expect(folderChain).toHaveLength(browserFolderChainFixtures.length);
        expect(folderChain[0]).toMatchObject({
            id: 'folder:root',
            name: 'All files',
            isDir: true,
            selectable: false,
        });
        expect(folderChain[2]).toMatchObject({
            id: 'remote:gdrive:folder:campaign',
            browserSourceLabel: 'Design Google Drive',
        });
    });

    it('renders the M3 fixture set through the current FullFileBrowser surface', () => {
        const files = adaptBrowserItemsToFileArray(browserItemFixtures);
        const folderChain = adaptBrowserFolderChainToFileArray(browserFolderChainFixtures);

        render(
            <FullFileBrowser
                files={files}
                folderChain={folderChain}
                defaultFileViewActionId={ChonkyActions.EnableListView.id}
                disableDragAndDrop
                thumbnailGenerator={browserItemThumbnailGenerator}
            />
        );

        expect(screen.getByText(`${browserItemFixtures.length} items`)).toBeTruthy();
        expect(screen.getByText('Campaign')).toBeTruthy();
        expect(screen.getByText('Brand assets')).toBeTruthy();
    });

    it('adapts a 1000+ item data set without deriving provider meaning from IDs', () => {
        const sourceItems = browserItemFixtures.filter((item) => item.kind === 'file');
        const generatedItems: BrowserItem[] = Array.from({ length: 1200 }, (_, index) => {
            const source = sourceItems[index % sourceItems.length];
            return {
                ...source,
                id: createBrowserOpaqueId(`generated:${index}`),
                name: `Generated file ${String(index).padStart(4, '0')}${source.extension ?? ''}`,
            };
        });

        const files = adaptBrowserItemsToFileArray(generatedItems);

        expect(files).toHaveLength(1200);
        expect(files[0]?.id).toBe('generated:0');
        expect(files[0]?.browserItem.ref).toEqual(sourceItems[0].ref);
        expect(files[1199]?.id).toBe('generated:1199');
        expect(files[1199]?.browserSourceLabel).toBeDefined();
    });
});
