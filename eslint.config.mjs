import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";
import prettierConfig from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCI = process.env.CI === "true" || process.env.NODE_ENV === "production";

export default tseslint.config(
  // Global ignores for paths we do not want to lint
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/prisma/migrations/**",
      "**/*.config.mjs",
      "**/*.config.ts",
      "**/*.config.js"
    ]
  },
  
  // Base JavaScript and TypeScript configurations
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // General configuration for all Source Files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      "unused-imports": unusedImportsPlugin,
      tailwindcss: tailwindcssPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      
      // React 17+ support
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      
      // Tailwind CSS rules
      "tailwindcss/classnames-order": "error",
      "tailwindcss/no-custom-classname": "warn",
      
      // Unused imports prune rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      
      // Import sorting
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          },
          "newlines-between": "always"
        }
      ],
      
      // Dynamic Console.log restriction (Warn in Dev, Error in CI/Production)
      "no-console": [isCI ? "error" : "warn", { allow: ["warn", "error"] }],
      
      // Route paths check (No hardcoded paths starting with routes - must use @config/routes)
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='href'] > Literal[value=/^\\/(dashboard|api|sign-in|sign-up)/]",
          message: "Do not use hardcoded route paths. Import routes from '@config/routes'."
        },
        {
          selector: "CallExpression[callee.name='push'] > Literal[value=/^\\/(dashboard|api|sign-in|sign-up)/]",
          message: "Do not use hardcoded route paths in navigation. Import routes from '@config/routes'."
        }
      ],

      // Enforce correct React directives ('use client' / 'use server') by ensuring they appear at the top of files
      "react/jsx-filename-extension": ["error", { extensions: [".jsx", ".tsx"] }]
    }
  },
  
  // Architectural Boundary: No Direct Prisma calls outside of Server Repositories
  {
    files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
    ignores: [
      "**/repositories/**",
      "**/src/server/repositories/**",
      "**/packages/db/**"
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@pulseguard/db",
              message: "Direct database access is only allowed inside server repositories (src/server/repositories/)."
            },
            {
              name: "@prisma/client",
              message: "Direct database access is only allowed inside server repositories (src/server/repositories/)."
            }
          ]
        }
      ]
    }
  },
  
  // Prettier alignments: must be defined last to override style conflicts
  prettierConfig
);
