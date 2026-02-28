import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",  // Node.js builtins
            "external", // npm packages
            "internal", // @/ imports
            "parent",   // ../ imports
            "sibling",  // ./ imports
            "index",    // ./index
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@/convex/_generated/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Phase 3 - T3.6: Component Health Enforcement Rules
      // These rules help maintain component standards and catch violations
      
      // Warn on raw HTML buttons (should use Button primitive)
      "react/forbid-elements": [
        "warn",
        {
          forbid: [
            {
              element: "button",
              message: "Use <Button> from @/components/ui/button instead of raw <button> tags. Raw buttons lack consistent styling and accessibility features.",
            },
          ],
        },
      ],

      // Warn on inline styles with colors (should use tokens)
      "react/forbid-component-props": [
        "warn",
        {
          forbid: [
            {
              propName: "style",
              message: "Avoid inline styles. Use Tailwind classes with semantic tokens instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Custom rules for token enforcement
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      // Note: These are custom patterns that would need a custom ESLint plugin
      // For now, documented as guidelines. To fully enforce, create eslint-plugin-gayla-shop
      
      // Guidelines (enforced via code review + grep audits):
      // 1. No system-* tokens (use semantic tokens)
      // 2. No hardcoded hex colors outside globals.css
      // 3. No raw <input> tags (use Input primitive)
      // 4. Prefer composites for repeated patterns
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    "convex/_generated/**",
  ]),
]);

export default eslintConfig;
