import js from "@eslint/js";

// Standalone config — avoid depending on @fuck-shorts/eslint-config (cycle).
export default [
  js.configs.recommended,
  {
    ignores: ["**/node_modules/**"],
  },
];
