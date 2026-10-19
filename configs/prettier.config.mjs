import { fileURLToPath } from "node:url";

// Resolve plugins from this package, so they load even when the consumer
// doesn't have them as direct dependencies (pnpm doesn't hoist them).
const resolve = (name) => fileURLToPath(import.meta.resolve(name));

const config = {
  plugins: [
    resolve("@trivago/prettier-plugin-sort-imports"),
    // Must be the last plugin
    resolve("prettier-plugin-tailwindcss"),
  ],
  // Customize group order as needed
  importOrder: [
    "^react$",
    "^(node:.*)$", // Node built-ins (node:fs, node:path, etc.)
    "^@?\\w", // Packages
    "^@/(.*)$", // Aliased imports (e.g., @/...)
    "^[./]", // Relative imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
