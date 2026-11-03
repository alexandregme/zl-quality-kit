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

| File                                   | Content                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `eslint.config.mjs`                    | `export { default } from "@alexandregme/zl-quality-kit/eslint"`                                                     |
| `prettier.config.mjs`                  | `export { default } from "@alexandregme/zl-quality-kit/prettier"`                                                   |
| `stylelint.config.mjs`                 | `export { default } from "@alexandregme/zl-quality-kit/stylelint"`                                                  |
| `.editorconfig`                        | UTF-8, LF, 2-space indent                                                                                           |
| `.prettierignore`                      | lockfiles                                                                                                           |
| `.github/workflows/zl-quality-kit.yml` | weekly GitHub Actions workflow that keeps the kit wired; owned by the kit and rewritten on every `init` (see below) |
| `.github/workflows/zljs-update.yml`    | weekly GitHub Actions workflow that updates zljs; only in apps with `@alexandregme/zljs`; owned by the kit as well  |

It also adds two scripts to `package.json` when they don't exist yet:

```json
{
  "lint": "eslint . && prettier --check . && stylelint \"**/*.{css,scss}\" --allow-empty-input",
  "lint:fix": "eslint . --fix && prettier --write . && stylelint \"**/*.{css,scss}\" --fix --allow-empty-input"
}
```

If it finds legacy files (`.eslintrc*`, `.prettierrc*`, `.stylelintrc*`) it warns you to remove them: ESLint 9 ignores them, and Prettier/Stylelint would use them instead of the generated configs.

## Keeping the kit and zljs wired

The generated workflows call the reusable workflows in [`alexandregme/zl-workflows`](https://github.com/alexandregme/zl-workflows), on a schedule and on demand from the Actions tab. Each opens a pull request with whatever changed, requesting a review from the repository owner. Nothing is pushed to the base branch.

| Workflow                               | When                                  | Does                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/zl-quality-kit.yml` | Wednesday, 09:00 Brasília (12:00 UTC) | installs the kit if it is missing or updates it to the latest version, re-runs `zl-lint init` (which also refreshes both workflow files), applies `lint:fix`, checks `pnpm lint` and `pnpm build`. A failing check holds the PR.                                                                            |
| `.github/workflows/zljs-update.yml`    | Thursday, 09:00 Brasília (12:00 UTC)  | updates `@alexandregme/zljs` to the latest version, applies `lint:fix`, runs `pnpm lint`, `pnpm test` and `pnpm build`. A failing check does **not** hold the PR: it opens anyway saying what broke, and the run ends red, so an update that breaks the app gets looked at. Only written in apps with zljs. |

The day after the kit, so a kit release and a zljs release reach an app in two separate pull requests.

The workflow files are **owned by the kit**: `init` rewrites them on every run, so a new kit version updates them through the next pull request. Don't edit them. Per-repository settings go in `package.json`, where both reusable workflows read them:

```json
{
  "zlQualityKit": {
    "prettierPaths": ["src/app/api/[...path]"],
    "reviewers": ["login1", "login2"],
    "build": false,
    "test": false
  }
}
```

All keys are optional: `prettierPaths` are extra folders passed to Prettier, `reviewers` defaults to the repository owner, `build: false` skips `pnpm build` in both, and `test: false` skips `pnpm test` in `zljs-update`. If a repository doesn't want a schedule, disable that workflow in the Actions tab: deleting the file doesn't last, because `init` writes it again.

Each repository needs a `ZL_GH_TOKEN` secret: a fine-grained personal access token with access to the repository and these repository permissions, all **Read and write**: Contents, Pull requests and Workflows. The default `GITHUB_TOKEN` can't do it, because GitHub never lets it create or change files in `.github/workflows/`, which `init` rewrites. The commit and the pull request are made as you, and the workflows receive the secret through `secrets: inherit`.

The first step of each workflow checks the token before the checkout, and stops the run in seconds, with the reason and how to create the token in the log, when the secret is missing, GitHub rejects it, or it can't reach the repository. A fine-grained token exposes no write permissions through the API, so those are only enforced at the push. See the [`zl-workflows` README](https://github.com/alexandregme/zl-workflows#token).

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
