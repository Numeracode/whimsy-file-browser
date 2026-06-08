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
