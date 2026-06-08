# Whimsy File Browser

Numeracode's public maintenance fork of Chonky for the Whimsy file-browser
extraction arc.

This repo keeps the file browser, tree picker, drag/drop, icon, and future
preview pieces in a separate package lane so Whimsy can consume a hardened
component instead of carrying thousands of lines of custom browser UI in the
main app.

## Packages

```bash
npm install @numeracode/whimsy-file-browser @numeracode/whimsy-file-browser-icons
```

```ts
import { FullFileBrowser, setChonkyDefaults } from '@numeracode/whimsy-file-browser';
import { ChonkyIconFA } from '@numeracode/whimsy-file-browser-icons';

setChonkyDefaults({ iconComponent: ChonkyIconFA });
```

The public TypeScript API intentionally keeps the existing `Chonky*` export
names during the extraction work. Package ownership is scoped to Numeracode;
symbol renaming is deferred until Whimsy parity is proven.

## BrowserItem Shell

New Whimsy integration should use the provider-agnostic `BrowserShell` surface.
It consumes opaque `BrowserItem` objects and emits callbacks; it does not call
Whimsy APIs or parse provider IDs.

```tsx
import { BrowserShell, browserItemFixtures } from '@numeracode/whimsy-file-browser';

export function MyBrowser() {
    return (
        <BrowserShell
            items={browserItemFixtures}
            onOpen={({ itemId }) => console.log('open', itemId)}
            onPreview={({ itemId }) => console.log('preview', itemId)}
        />
    );
}
```

## Preview Shell

Preview UI also lives in this package lane. `PreviewShell` renders signed
preview assets supplied by the host app; it never signs URLs, reads tokens, or
parses provider-specific IDs.

```tsx
import { PreviewShell } from '@numeracode/whimsy-file-browser';

export function MyPreview({ item }) {
    return (
        <PreviewShell
            item={item}
            loadPreview={({ item }) => api.getPreviewManifest(item.id)}
        />
    );
}
```

Use the same `PreviewShell` from filebrowser, spaces, showcase, dedupe, and any
gallery surface. Whimsy remains responsible for auth, permission checks, and
signed manifest generation.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run build
npm pack --workspace packages/chonky --dry-run
npm pack --workspace packages/chonky-icon-fontawesome --dry-run
```

## Ownership

- Public repo: <https://github.com/Numeracode/whimsy-file-browser>
- Project board: <https://github.com/orgs/Numeracode/projects/1>
- Issues: <https://github.com/Numeracode/whimsy-file-browser/issues>

## Upstream Attribution

This package lane is based on the MIT-licensed Chonky project:
<https://github.com/TimboKZ/Chonky>.

Original copyright notices are retained in the license files and source headers.
The upstream project documentation remains useful for legacy API context, but
new Whimsy integration work should use the scoped Numeracode packages above.

## License

MIT. See `LICENSE` and package-level `LICENSE` files for upstream attribution.
