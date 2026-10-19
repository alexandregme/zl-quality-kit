# zl-quality-kit

Shared **ESLint 9**, **Prettier 3** and **Stylelint 16** configs for React / Next.js projects (with Tailwind CSS), plus a `zl-lint init` command that wires them into a project.

Published on npm as [`@alexandregme/zl-quality-kit`](https://www.npmjs.com/package/@alexandregme/zl-quality-kit).

## Requirements

- Node.js 20.6+
- `eslint@9`, `prettier@3`, `stylelint@16` (peer dependencies)
- TypeScript projects: `typescript` below 6.1 (current `typescript-eslint` limit)

## Quick start

```bash
pnpm add -D @alexandregme/zl-quality-kit eslint@9 prettier@3 stylelint@16
pnpm exec zl-lint init
pnpm lint
```

`zl-lint init` writes these files to the current directory, **skipping any that already exist** (use `--force` to overwrite):

| File                   | Content                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `eslint.config.mjs`    | `export { default } from "@alexandregme/zl-quality-kit/eslint"`    |
| `prettier.config.mjs`  | `export { default } from "@alexandregme/zl-quality-kit/prettier"`  |
| `stylelint.config.mjs` | `export { default } from "@alexandregme/zl-quality-kit/stylelint"` |
| `.editorconfig`        | UTF-8, LF, 2-space indent                                          |
| `.prettierignore`      | lockfiles                                                          |

It also adds two scripts to `package.json` when they don't exist yet:

```json
{
  "lint": "eslint . && prettier --check . && stylelint \"**/*.{css,scss}\" --allow-empty-input",
  "lint:fix": "eslint . --fix && prettier --write . && stylelint \"**/*.{css,scss}\" --fix --allow-empty-input"
}
```

If it finds legacy files (`.eslintrc*`, `.prettierrc*`, `.stylelintrc*`) it warns you to remove them: ESLint 9 ignores them, and Prettier/Stylelint would use them instead of the generated configs.

## Using the configs directly

Each config is exported, so you can extend it instead of running `init`:

```js
// eslint.config.mjs
import zl from "@alexandregme/zl-quality-kit/eslint";

export default [...zl, { rules: { "no-console": "warn" } }];
```

```js
// prettier.config.mjs
import zl from "@alexandregme/zl-quality-kit/prettier";

export default { ...zl, semi: false };
```

```js
// stylelint.config.mjs
export { default } from "@alexandregme/zl-quality-kit/stylelint";
```

## What's included

**ESLint** (flat config):

- `@eslint/js` recommended
- TypeScript (`.ts`, `.tsx`): `@typescript-eslint` recommended, `no-explicit-any` as a warning
- React (`.jsx`, `.tsx`): `eslint-plugin-react`, `react-hooks` and `jsx-a11y` recommended rules; no React import needed
- Next.js: a subset of `@next/eslint-plugin-next` rules (`no-img-element`, `no-sync-scripts`, `no-css-tags`, `no-head-element`, font and GA rules)
- `eslint-config-prettier` last, so formatting is left to Prettier
- Ignores `node_modules`, `.next`, `dist`, `build`, `coverage`

**Prettier**:

- `@trivago/prettier-plugin-sort-imports`: React first, then Node built-ins, packages, `@/` aliases and relative imports, separated by blank lines
- `prettier-plugin-tailwindcss`: sorts Tailwind classes

**Stylelint**:

- `stylelint-config-standard` and `stylelint-config-tailwindcss`
- Tailwind CSS v3 and v4 at-rules allowed (`@tailwind`, `@apply`, `@layer`, `@theme`, `@source`, `@utility`, `@variant`, `@custom-variant`, `@plugin`, `@config`, `@reference`)
- `postcss-scss` for `.scss`, `postcss-html` for `.html`

Plugins are resolved from this package, so you don't need to install them yourself.

## Changes in 2.0

Version 1.x used a `postinstall` script to copy configs and overwrite `package.json` scripts. That script was removed: package managers like pnpm block dependency install scripts by default, and it overwrote existing scripts without asking. Run `zl-lint init` instead.

`eslint-plugin-tailwindcss` was dropped because it doesn't support Tailwind CSS v4; class ordering is handled by `prettier-plugin-tailwindcss`.

## Releases

Versioning is driven by the PR title (Conventional Commits, squash-merged): `feat:` → minor, `type!:` or `BREAKING CHANGE:` → major, anything else → patch. On merge to `main`, `.github/workflows/release.yml` bumps the version, tags it, creates the GitHub Release and publishes to npm with provenance (Trusted Publishing).

## License

[MIT](./LICENSE)
