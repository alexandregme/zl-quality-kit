import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, it } from "node:test";

import { init } from "../bin/zl-lint.mjs";

const silent = () => {};
let dir;

const read = (file) => fs.readFileSync(path.join(dir, file), "utf8");
const writePkg = (pkg) =>
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg));

describe("zl-lint init", () => {
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "zl-lint-"));
  });

  it("writes the config files", () => {
    writePkg({ name: "app" });
    init(dir, { log: silent });

    assert.match(
      read("eslint.config.mjs"),
      /@alexandregme\/zl-quality-kit\/eslint/,
    );
    assert.match(
      read("prettier.config.mjs"),
      /@alexandregme\/zl-quality-kit\/prettier/,
    );
    assert.match(
      read("stylelint.config.mjs"),
      /@alexandregme\/zl-quality-kit\/stylelint/,
    );
    assert.match(read(".editorconfig"), /root = true/);
    assert.match(read(".prettierignore"), /pnpm-lock\.yaml/);
  });

  it("adds lint scripts", () => {
    writePkg({ name: "app", scripts: { dev: "next dev" } });
    init(dir, { log: silent });

    const { scripts } = JSON.parse(read("package.json"));
    assert.equal(scripts.dev, "next dev");
    assert.match(scripts.lint, /^eslint \. && prettier --check \./);
    assert.match(scripts["lint:fix"], /^eslint \. --fix/);
  });

  it("keeps existing files and scripts", () => {
    writePkg({ name: "app", scripts: { lint: "my lint" } });
    fs.writeFileSync(path.join(dir, "eslint.config.mjs"), "custom");
    init(dir, { log: silent });

    assert.equal(read("eslint.config.mjs"), "custom");
    assert.equal(JSON.parse(read("package.json")).scripts.lint, "my lint");
  });

  it("overwrites existing files and scripts with force", () => {
    writePkg({ name: "app", scripts: { lint: "my lint" } });
    fs.writeFileSync(path.join(dir, "eslint.config.mjs"), "custom");
    init(dir, { force: true, log: silent });

    assert.match(read("eslint.config.mjs"), /zl-quality-kit/);
    assert.notEqual(JSON.parse(read("package.json")).scripts.lint, "my lint");
  });

  it("works without a package.json", () => {
    init(dir, { log: silent });

    assert.ok(fs.existsSync(path.join(dir, "eslint.config.mjs")));
    assert.ok(!fs.existsSync(path.join(dir, "package.json")));
  });

  it("warns about legacy config files", () => {
    writePkg({ name: "app" });
    fs.writeFileSync(path.join(dir, ".eslintrc.js"), "");
    const lines = [];
    init(dir, { log: (line) => lines.push(line) });

    assert.ok(
      lines.some((line) => line.includes("warning: remove .eslintrc.js")),
    );
  });
});
