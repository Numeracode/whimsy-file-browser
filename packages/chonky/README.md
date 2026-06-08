# `@numeracode/whimsy-file-browser`

Provider-agnostic React file browser package maintained by Numeracode for
Whimsy.

```bash
npm install @numeracode/whimsy-file-browser @numeracode/whimsy-file-browser-icons
```

```tsx
import { FullFileBrowser, setChonkyDefaults } from '@numeracode/whimsy-file-browser';
import { ChonkyIconFA } from '@numeracode/whimsy-file-browser-icons';

setChonkyDefaults({ iconComponent: ChonkyIconFA });

export function MyBrowser() {
    return (
        <div style={{ height: 400 }}>
            <FullFileBrowser
                files={[
                    { id: 'projects', name: 'Projects', isDir: true },
                    { id: 'readme', name: 'README.md', size: 1024 },
                ]}
                folderChain={[{ id: 'root', name: 'Home', isDir: true }]}
            />
        </div>
    );
}
```

The exported component/type names currently retain the upstream `Chonky*` naming
for compatibility. The package boundary is owned by Numeracode.

## BrowserItem-native shell

Use `BrowserShell` for new Whimsy adapters. It renders `BrowserItem` data
natively, supports controlled or uncontrolled selection, and exposes
open/preview/navigation/action callbacks with opaque IDs.

```tsx
import { BrowserShell, browserItemFixtures } from '@numeracode/whimsy-file-browser';

export function MyBrowser() {
    return <BrowserShell items={browserItemFixtures} onOpen={({ itemId }) => console.log(itemId)} />;
}
```

## Provider-agnostic previews

Use `PreviewShell`, `FilePreviewer`, `PreviewTile`, and `MediaLightbox` from the
preview-only subpath for new preview integrations. The package renders
manifests and signed URLs supplied by the host app; it does not include Whimsy
auth, provider credentials, or signing logic.

```tsx
import { MediaLightbox, PreviewTile } from '@numeracode/whimsy-file-browser/preview';

export function PreviewExample({ item, open, setOpen }) {
    return (
        <>
            <PreviewTile item={item} onPreview={() => setOpen(true)} />
            <MediaLightbox
                item={item}
                loadPreview={({ item }) => api.getPreviewManifest(item.id)}
                onOpenChange={setOpen}
                open={open}
            />
        </>
    );
}
```

## Development

```bash
npm run typecheck --workspace packages/chonky
npm run build --workspace packages/chonky
npm run test --workspace packages/chonky
npm pack --workspace packages/chonky --dry-run
```

## Upstream Attribution

This package is based on the MIT-licensed Chonky project:
<https://github.com/TimboKZ/Chonky>.

Original copyright notices are retained in `LICENSE` and source headers.
