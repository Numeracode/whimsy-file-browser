import {
    browserFolderChainFixtures,
    browserItemFixtures,
    createBrowserOpaqueId,
    createBrowserTransferIntent,
    resolveBrowserTransferOperation,
} from '../src';

describe('browser transfer intents', () => {
    it('resolves copy and move hints from modifier state', () => {
        expect(resolveBrowserTransferOperation({})).toBe('move');
        expect(resolveBrowserTransferOperation({ ctrlKey: true })).toBe('copy');
        expect(resolveBrowserTransferOperation({ metaKey: true })).toBe('copy');
        expect(resolveBrowserTransferOperation({ shiftKey: true }, 'copy')).toBe('move');
    });

    it('creates an opaque host transfer intent from source and destination snapshots', () => {
        const hero = browserItemFixtures.find((item) => item.id === 'image:hero')!;
        const contract = browserItemFixtures.find((item) => item.id === 'pdf:contract')!;
        const destination = browserFolderChainFixtures.at(-1)!;

        const intent = createBrowserTransferIntent({
            source: {
                item: hero,
                selectedItems: [hero, contract],
                selection: {
                    selectedIds: [hero.id, contract.id],
                    focusedId: contract.id,
                },
            },
            drop: {
                target: {
                    kind: 'listing',
                    folder: destination,
                    folderId: destination.id,
                },
            },
            modifiers: { ctrlKey: true },
        });

        expect(intent).toEqual(
            expect.objectContaining({
                operation: 'copy',
                activeItemId: 'image:hero',
                destinationFolderId: destination.id,
                sourceIds: ['image:hero', 'pdf:contract'],
                sourceItems: [hero, contract],
            })
        );
    });

    it('rejects dropping a folder selection into itself', () => {
        const folder = browserItemFixtures.find((item) => item.id === 'folder:brand-assets')!;

        const intent = createBrowserTransferIntent({
            source: {
                item: folder,
                selectedItems: [folder],
                selection: {
                    selectedIds: [folder.id],
                    focusedId: folder.id,
                },
            },
            drop: {
                target: {
                    kind: 'folder',
                    folderId: createBrowserOpaqueId('folder:brand-assets'),
                },
            },
        });

        expect(intent).toBeNull();
    });
});
