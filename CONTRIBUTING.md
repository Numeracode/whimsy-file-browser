# Contributing

This is Numeracode's maintenance fork of Chonky for the Whimsy file-browser
extraction lane. Use GitHub issues and PRs in
`Numeracode/whimsy-file-browser`; do not send Whimsy-specific work upstream.

## Setup

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Package dry-run checks:

```bash
npm pack --workspace packages/chonky --dry-run
npm pack --workspace packages/chonky-icon-fontawesome --dry-run
```

## Branching

The default branch is `2.x`. Open PRs against `2.x`.

## Package Names

Published package identity is owned by Numeracode:

- `@numeracode/whimsy-file-browser`
- `@numeracode/whimsy-file-browser-icons`

Keep upstream MIT attribution intact in license files and source headers.
