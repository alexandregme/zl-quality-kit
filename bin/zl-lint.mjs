#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templatesDir = fileURLToPath(new URL("../templates/", import.meta.url));

const FILES = [
  { template: "eslint.config.mjs", target: "eslint.config.mjs" },
  { template: "prettier.config.mjs", target: "prettier.config.mjs" },
  { template: "stylelint.config.mjs", target: "stylelint.config.mjs" },
  { template: "editorconfig", target: ".editorconfig" },
  { template: "prettierignore", target: ".prettierignore" },
];

const STYLE_GLOB = '"**/*.{css,scss}"';
const SCRIPTS = {
  lint: `eslint . && prettier --check . && stylelint ${STYLE_GLOB} --allow-empty-input`,
  "lint:fix": `eslint . --fix && prettier --write . && stylelint ${STYLE_GLOB} --fix --allow-empty-input`,
};

// Legacy files that ESLint 9 ignores or that take precedence over the generated configs
const LEGACY = [
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".prettierrc",
  ".prettierrc.js",
  ".prettierrc.json",
  ".stylelintrc",
  ".stylelintrc.js",
  ".stylelintrc.json",
];

const USAGE = `Usage: zl-lint init [--force]

Writes eslint.config.mjs, prettier.config.mjs, stylelint.config.mjs,
.editorconfig and .prettierignore to the current directory, and adds "lint" / "lint:fix" scripts
to package.json. Existing files and scripts are kept unless --force is given.`;

export function init(cwd, { force = false, log = console.log } = {}) {
  for (const { template, target } of FILES) {
    const targetPath = path.join(cwd, target);
    if (fs.existsSync(targetPath) && !force) {
      log(`skip   ${target} (already exists, use --force to overwrite)`);
      continue;
    }
    fs.copyFileSync(path.join(templatesDir, template), targetPath);
    log(`write  ${target}`);
  }

  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) {
    log("skip   package.json scripts (no package.json found)");
  } else {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.scripts ??= {};
    for (const [name, command] of Object.entries(SCRIPTS)) {
      if (pkg.scripts[name] && !force) {
        log(`skip   script "${name}" (already exists)`);
        continue;
      }
      pkg.scripts[name] = command;
      log(`script ${name}`);
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  const legacy = LEGACY.filter((file) => fs.existsSync(path.join(cwd, file)));
  if (legacy.length > 0) {
    log(
      `\nwarning: remove ${legacy.join(", ")} — they are ignored by ESLint 9 or override the generated configs.`,
    );
  }

  log(
    "\nNext: install the tools as dev dependencies (TypeScript projects need typescript < 6.1):\n  pnpm add -D eslint@9 prettier@3 stylelint@16",
  );
}

const isMain =
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const [command, ...args] = process.argv.slice(2);
  if (command !== "init") {
    console.log(USAGE);
    process.exit(command ? 1 : 0);
  }
  init(process.cwd(), { force: args.includes("--force") });
}
