# BrowserItem Render Bridge Spike

Date: 2026-06-08

## Result

The M3 `BrowserItem` contract can be rendered through the current package API by
mapping it to legacy `FileData`. This does not complete B1, but it proves the
fork can accept Whimsy-style opaque IDs, source labels, preview metadata, and
1000+ item lists without provider-specific assumptions.

## What Was Proven

- `BrowserItem.id` remains the rendered ID; no provider/native ID parsing is
  required.
- Available thumbnails map to `FileData.thumbnailUrl`; unavailable/pending
  thumbnails stay unavailable and keep retry/error metadata on `browserItem`.
- Folder chains map to the legacy `folderChain` shape without losing source
  metadata.
- The current `FullFileBrowser` can render the M3 fixture set through the bridge.
- A 1200 item generated data set adapts without deriving provider meaning from
  IDs.

## What Is Still Missing

- B1 still needs a controlled shell that consumes `BrowserItem` natively rather
  than through legacy `FileData`.
- B1 still needs host-replaceable toolbar/context actions, controlled selection,
  and explicit open/preview/navigation callbacks using opaque IDs.
- W1 should wait for B1/B2 unless it intentionally uses this bridge as a short
  temporary adapter.
