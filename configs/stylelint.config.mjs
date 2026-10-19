import { fileURLToPath } from "node:url";

// Resolve shared configs and syntaxes from this package, so they load even
// when the consumer doesn't have them as direct dependencies.
const resolve = (name) => fileURLToPath(import.meta.resolve(name));

const config = {
  extends: [
    resolve("stylelint-config-standard"),
    resolve("stylelint-config-tailwindcss"),
  ],
  overrides: [
    {
      files: ["**/*.html"],
      customSyntax: resolve("postcss-html"),
    },
    {
      files: ["**/*.scss"],
      customSyntax: resolve("postcss-scss"),
    },
  ],
  rules: {
    "no-empty-source": null,
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "layer",
          "variants",
          "theme",
          "source",
          "utility",
          "variant",
          "custom-variant",
          "plugin",
          "config",
          "reference",
        ],
      },
    ],
  },
};

export default config;
