# Template for a browser extension

Build a browser extension with React + TypeScript + esbuild.

## Basic Usage

Following examples are for `yarn`. For `npm`, please translate by yourself.

### Build

Firefox:

```
yarn run build:firefox
```

With watch mode:

```
yarn run build:firefox --watch
```

Enable source map:

```
yarn run build:firefox --dev
```

Chrome:

```
yarn run build:chrome
```

### Run with browsers

Firefox:

```
yarn run run:firefox
```

Chrome

```
yarn run run:chrome
```

### Create a package for Firefox (zip)

```
yarn run package:firefox
```

To install an unsigned add-on, you must use Firefox Developer Edition.
https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox

### ESLint

```
yarn run eslint . --ext .js,.jsx,.ts,.tsx
```

### Prettier

```
yarn run prettier --write .
```

## Customization

### Change Add-on ID for Firefox

Edit `firefox.json`.

### Add `background_scripts, etc.`

Edit build.ts and configure [esbuild](https://esbuild.github.io/).
