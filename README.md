# Template for a browser extension

Build a browser extension with React + TypeScript + esbuild.
Supporting both Firefox and Chrome.

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

Build for both browsers:

```
yarn build
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

To install an unsigned add-on, you must use Firefox Developer Edition and change settings.
https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox

### ESLint

```
yarn run lint
```

#### Fix

```
yarn run lint:fix
```

### Prettier

```
yarn run format
```

## Customization

### Change Add-on ID for Firefox

Edit `firefox.json`.
It looks like ID need to match following format:

- `{<UUID>}`
  - e.g. `{abac34b6-b4bd-4fc7-af89-6f7d30be386b}`
- `<alphanum>@<alphanum>`
  - e.g. `dummy@dummy`

cf. https://stackoverflow.com/questions/45339492/firefox-add-on-id-conventions

### Add background_scripts, etc.

Edit `build.ts` and configure [esbuild](https://esbuild.github.io/).

## For Japanese users

Here is an article about this template.  
https://zenn.dev/htlsne/articles/web-ext-react-esbuild
