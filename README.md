<p align="center">
    <img src="https://chonky.io/chonky-logo-v2.png" alt="Chonky v2 Logo" width="500" />
    <br />
    <a href="https://www.npmjs.com/package/chonky">
        <img
            alt="NPM package"
            src="https://img.shields.io/npm/v/chonky.svg?style=flat&colorB=ffac5c"
        />
    </a>
    <a href="https://tldrlegal.com/license/mit-license">
        <img
            alt="MIT license"
            src="https://img.shields.io/npm/l/chonky?style=flat&colorB=dcd67a"
        />
    </a>
    <a href="https://www.npmjs.com/package/chonky">
        <img
            alt="NPM downloads"
            src="https://img.shields.io/npm/dt/chonky?style=flat&colorB=aef498"
        />
    </a>
    <a href="https://github.com/TimboKZ/Chonky">
        <img
            alt="GitHub stars"
            src="https://img.shields.io/github/stars/TimboKZ/Chonky?style=flat&colorB=50f4cc"
        />
    </a>
    <a href="https://discord.gg/4HJaFn9">
        <img
            alt="Chat on Discord"
            src="https://img.shields.io/discord/696033621986770957?label=discord&style=flat&colorB=08acee"
        />
    </a>
    <br />
    <br />
    <br />
</p>

## Numeracode Maintenance Fork

This is Numeracode's public maintenance fork of Chonky for the Whimsy file-browser
extraction arc. The immediate goal is to keep the hardened Chonky browser model in a
separate package lane while we modernize the toolchain, React compatibility, styling,
tree picker, and preview integrations outside the main Whimsy app.

- Public repo: <https://github.com/Numeracode/whimsy-file-browser>
- Project board: <https://github.com/orgs/Numeracode/projects/1>
- Upstream project: <https://github.com/TimboKZ/Chonky>

Current maintenance baseline:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Known follow-up work is tracked on the project board. The first runtime-dependency
cutover is M2, which removes or isolates the remaining MUI v4 and old FontAwesome
wrappers before raising the consumer React peer range.

## Upstream Chonky

Chonky is a file browser component for React. It tries to recreate the native file
browsing experience in your browser. This means your users can make selections, drag
& drop files, toggle between _List_ and _Grid_ file views, use keyboard shortcuts, and
much more!

### [Click here for documentation and examples.](https://chonky.io/)

> Please use the Numeracode issue tracker for this fork:
> <https://github.com/Numeracode/whimsy-file-browser/issues>.

## Preview

<p align="center">
  <img src="https://chonky.io/chonky-v2-preview.gif" alt="Chonky preview">
</p>

## License

MIT © [Tim Kuzhagaliyev](https://github.com/TimboKZ) 2020
