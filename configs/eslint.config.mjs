import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import a11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },

  // JS base
  js.configs.recommended,

  // Node scripts and config files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
      },
    },
  },

  // Arquivos TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // React + Hooks + A11y
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": a11y },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { React: "readonly" },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      // React 17+ / Next: não precisa importar React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },

  // Regras Next (equivalentes ao core‑web‑vitals mais usadas)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      "@next/next/no-img-element": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-css-tags": "error",
      "@next/next/no-head-element": "error",
      "@next/next/google-font-display": "warn",
      "@next/next/google-font-preconnect": "warn",
      "@next/next/next-script-for-ga": "warn",
      // Observação: '@next/next/no-html-link-for-pages' é obsoleta no App Router.
    },
  },

  // Desliga conflitos com Prettier
  prettier,
];
