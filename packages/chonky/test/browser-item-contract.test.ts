import {
    browserFolderChainFixtures,
    browserItemFixtures,
    browserSelectionFixture,
    browserSourceFixtures,
} from '../src';

describe('BrowserItem contract fixtures', () => {
    it('cover the item classes Whimsy needs for the first adapter spike', () => {
        const itemIds = new Set(browserItemFixtures.map((item) => item.id));

        expect(itemIds).toContain('folder:brand-assets');
        expect(itemIds).toContain('image:hero');
        expect(itemIds).toContain('video:walkthrough');
        expect(itemIds).toContain('pdf:contract');
        expect(itemIds).toContain('office:proposal');
        expect(itemIds).toContain('text:notes');
        expect(itemIds).toContain('remote:gdrive:video');
        expect(itemIds).toContain('remote:dropbox:spreadsheet');
        expect(itemIds).toContain('remote:onedrive:presentation');
        expect(itemIds).toContain('local:private:backup');
        expect(itemIds).toContain('preview:signing-failed');
        expect(itemIds).toContain('preview:expired');
        expect(itemIds).toContain('preview:none');
    });

    it('uses generic source kinds instead of provider-specific source kinds', () => {
        const sourceKinds = new Set(Object.values(browserSourceFixtures).map((source) => source.kind));

        expect(sourceKinds).toEqual(new Set(['private', 'local', 'remote']));
    });

    it('models preview availability, signing failure, expiry, and no-preview states', () => {
        const unavailableReasons = new Set(
            browserItemFixtures
                .flatMap((item) => [item.preview?.thumbnail, item.preview?.preview])
                .filter((asset) => asset?.status === 'unavailable')
                .map((asset) => asset.reason)
        );

        expect(unavailableReasons).toContain('signing_failed');
        expect(unavailableReasons).toContain('expired');
        expect(unavailableReasons).toContain('none');
        expect(unavailableReasons).toContain('unsupported');
    });

    it('keeps retryable preview failures preview-capable', () => {
        const retryableIds = ['preview:signing-failed', 'preview:expired'];
        const retryableItems = browserItemFixtures.filter((item) => retryableIds.includes(item.id));

        expect(retryableItems).toHaveLength(retryableIds.length);
        for (const item of retryableItems) {
            expect(item.capabilities?.preview).toBe(true);
            expect(item.preview?.preview?.status).toBe('unavailable');
            expect(item.preview?.preview?.canRetry).toBe(true);
        }
    });

    it('keeps IDs opaque and fixture data serializable', () => {
        for (const item of browserItemFixtures) {
            expect(typeof item.id).toBe('string');
            expect(item.id.length).toBeGreaterThan(0);
        }

        const serialized = JSON.stringify({
            items: browserItemFixtures,
            folderChain: browserFolderChainFixtures,
            selection: browserSelectionFixture,
        });
        const parsed = JSON.parse(serialized);

        expect(parsed.items).toHaveLength(browserItemFixtures.length);
        expect(parsed.folderChain).toHaveLength(browserFolderChainFixtures.length);
        expect(parsed.selection.selectedIds).toEqual(browserSelectionFixture.selectedIds);
    });
});
