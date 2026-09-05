import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint config.
 * Enforces `.cursor/rules/coding-standards.mdc` rule 1 (never regex) via AST bans.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "**/.wrangler/**",
      "**/node_modules/**",
      // Node build scripts (Satori, etc.) — not browser app source.
      "**/scripts/**",
    ],
  },
  {
    rules: {
      // Coding standards: NEVER use regex (literals, constructors, or pattern APIs).
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[regex]",
          message:
            "Never use regex. Prefer includes/startsWith/endsWith/indexOf/slice/loops (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector: "NewExpression[callee.name='RegExp']",
          message:
            "Never use new RegExp. Prefer string/index helpers (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.object.name='RegExp'][callee.property.name='compile']",
          message:
            "Never use RegExp.compile. Prefer string/index helpers (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='match'][arguments.0.type='Literal'][arguments.0.regex]",
          message:
            "Never use String.match with a regex. Prefer string/index helpers (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='replace'][arguments.0.type='Literal'][arguments.0.regex]",
          message:
            "Never use String.replace with a regex. Prefer string/index helpers (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='replaceAll'][arguments.0.type='Literal'][arguments.0.regex]",
          message:
            "Never use String.replaceAll with a regex. Prefer string/index helpers (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='split'][arguments.0.type='Literal'][arguments.0.regex]",
          message:
            "Never use String.split with a regex. Prefer split with a plain string (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='search'][arguments.0.type='Literal'][arguments.0.regex]",
          message:
            "Never use String.search with a regex. Prefer indexOf/includes (.cursor/rules/coding-standards.mdc).",
        },
        {
          // `/re/.test(s)` — object is the regex literal (Literal[regex] also catches this).
          selector:
            "CallExpression[callee.property.name='test'][callee.object.type='Literal'][callee.object.regex]",
          message:
            "Never use RegExp.test. Prefer includes/startsWith/endsWith/loops (.cursor/rules/coding-standards.mdc).",
        },
        {
          selector:
            "CallExpression[callee.property.name='exec'][callee.object.type='Literal'][callee.object.regex]",
          message:
            "Never use RegExp.exec. Prefer indexOf/includes/slice/loops (.cursor/rules/coding-standards.mdc).",
        },
      ],
    },
  },
];
