import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pagopaConfig from "@pagopa/eslint-config";
import tseslint from "typescript-eslint";
import reactNativeConfig from "@react-native/eslint-config/flat";
import importPlugin from "eslint-plugin-import";
import functional from "eslint-plugin-functional";
import sonarjs from "eslint-plugin-sonarjs";
import i18Next from "eslint-plugin-i18next";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const delegateEffectsRule = require("./scripts/eslint/delegate-effects.js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

// @typescript-eslint is already registered by pagopaConfig (via typescript-eslint).
// Strip it from @react-native/eslint-config/flat to avoid "Cannot redefine plugin" errors.
const reactNativeConfigWithoutTsPlugin = reactNativeConfig.map(config => {
  if (config.plugins?.["@typescript-eslint"]) {
    const { "@typescript-eslint": _removed, ...rest } = config.plugins;
    return { ...config, plugins: rest };
  }
  return config;
});

export default defineConfig([
  globalIgnores([
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
    "locales/locales.ts",
    "ts/utils/__tests__/xss.test.ts",
    "definitions/*",
    "**/*.typegen.ts"
  ]),

  // Pagopa base config: @eslint/js recommended, typescript-eslint strict+stylistic,
  // eslint-plugin-prettier, perfectionist.
  // Vitest block is excluded — project uses Jest.
  // Perfectionist block is excluded — sorting rules are deferred to a follow-up PR.
  ...pagopaConfig.filter(
    config => !config.plugins?.vitest && !config.plugins?.perfectionist
  ),

  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...reactNativeConfigWithoutTsPlugin,
      ...fixupConfigRules(compat.extends("plugin:react-native-a11y/all"))
    ],

    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",

      parserOptions: {
        project: "tsconfig.json",

        ecmaFeatures: {
          jsx: true
        }
      }
    },

    plugins: {
      // Remove `import` plugin once we adopt
      // `perfectionist/sort-imports` rules
      import: importPlugin,
      functional,
      sonarjs,
      i18next: i18Next,
      "typed-redux-saga": { rules: { "delegate-effects": delegateEffectsRule } }
    },

    rules: {
      // START: OVERWRITTEN RULES FROM PAGOPA/ESLINT-CONFIG
      //
      // Converting `type = {}` to `interface {}` breaks assignability to
      // `Record<string, unknown>` — TypeScript requires an explicit index
      // signature on interfaces, whereas type aliases satisfy it structurally.
      // This affects analytics helpers, navigation param lists, and any other
      // type used as a generic record argument throughout the codebase.
      "@typescript-eslint/consistent-type-definitions": "off",

      // Auto-fix corrupts multi-line property values (see comment below)
      "perfectionist/sort-objects": "off",

      // Rules from tseslint.strict / pagopa config that require widespread
      // refactoring incompatible with the current codebase
      "max-lines-per-function": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // Incorrectly fires on mapped types (`[P in ...]`) — only meant for
      // plain index signatures (`[key: string]: V`) which should use Record<K,V>
      "@typescript-eslint/consistent-indexed-object-style": "off",

      // END: OVERWRITTEN RULES FROM PAGOPA/ESLINT-CONFIG

      // CODE STYLE
      curly: "error",
      "spaced-comment": [
        "error",
        "always",
        {
          block: {
            balanced: true
          }
        }
      ],
      "one-var": ["error", "never"],
      "object-shorthand": "error",
      // TODO: Remove this property once the migration
      // from class components is completed
      "max-classes-per-file": ["error", 1],

      // GENERAL JS SAFETY
      // Deprecated since ESLint 5.1.0 — overrides @react-native/eslint-config warn
      "no-catch-shadow": "off",
      "no-case-declarations": "off",
      "no-underscore-dangle": "error",
      "no-throw-literal": "error",
      "no-console": "error",
      "no-caller": "error",
      "no-void": "off",
      "no-duplicate-imports": "error",
      // Remove the following `import` rule
      // once we adopt `perfectionist/sort-imports`
      "import/order": "error",

      // TYPESCRIPT
      // Downgraded to warn — existing shadows are widespread and non-critical
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/no-require-imports": [
        "error",
        {
          allow: [
            "\\.png$",
            "\\.jpg$",
            "\\.jpeg$",
            "\\.gif$",
            "\\.svg",
            "\\.webp$"
          ]
        }
      ],
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "generic"
        }
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/dot-notation": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/restrict-plus-operands": "error",

      // REACT
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      // Less relevant rule with contemporary React with hooks
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true
        }
      ],
      // It could highlight performance issues,
      // with some noise on trivial cases
      "react/no-unstable-nested-components": [
        "off",
        {
          allowAsProps: true
        }
      ],
      // TODO: Remove these two properties once the migration
      // from class components is completed
      "react/no-direct-mutation-state": "off",
      "react/require-render-return": "off",

      // REACT NATIVE
      "react-native/no-unused-styles": "error",
      "react-native/no-inline-styles": "off",
      "react-native/no-color-literals": "error",
      "react-native/no-single-element-style-arrays": "error",

      // ACCESSIBILITY
      "react-native-a11y/has-accessibility-hint": "off",

      // SONAR
      "sonarjs/no-nested-template-literals": "error",

      // FUNCTIONAL PROGRAMMING
      "functional/no-let": "error",
      "functional/immutable-data": [
        "error",
        {
          // TODO: Remove this once we migrate to newer versions of `react-navigation`
          ignoreAccessorPattern: [
            "navigation.**",
            "navigate.**",
            "StackActions.**"
          ]
        }
      ],

      // INTERNATIONALISATION
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",

          "jsx-attributes": {
            include: [
              "accessibilityLabel",
              "accessibilityHint",
              "placeholder",
              "title",
              "alt"
            ],
            exclude: []
          },

          "jsx-components": {
            include: [],
            exclude: ["Trans"]
          },

          words: {
            exclude: ["\\s+", "[0-9!-/:-@\\[-`{-~]+", "[•·]+", "."]
          },

          "object-properties": {
            include: [],
            exclude: ["testID"]
          }
        }
      ],

      // REDUX SAGA
      "typed-redux-saga/delegate-effects": "error",

      'import/no-extraneous-dependencies': ['error', {
        devDependencies: true, 
        optionalDependencies: false,
        peerDependencies: false,
      }],

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "i18n-js",
              message:
                'Importing I18n from "i18n-js" is not allowed. Import it from "ts/i18n.ts" instead.'
            },
            {
              name: "@pagopa/ts-commons",
              importNames: ["pot"],
              message:
                'Importing { pot } from "@pagopa/ts-commons" is not allowed. Use \'import * as pot from "@pagopa/ts-commons/lib/pot"\' instead.'
            },
            {
              name: "redux-saga/effects",
              message:
                'Importing from "redux-saga/effects" is not allowed. Use "typed-redux-saga/macro" instead for type-safe saga effects.'
            }
          ]
        }
      ]
    },

    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**/*.ts",
      "**/__tests__/**/*.tsx"
    ],

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-require-imports": "off",
      "i18next/no-literal-string": "off",
      "no-restricted-imports": "off"
    }
  },
  {
    files: [
      "**/design-system/**/*.ts",
      "**/design-system/**/*.tsx",
      "**/playgrounds/**/*.ts",
      "**/playgrounds/**/*.tsx",
      "**/devMode/**/*.ts",
      "**/devMode/**/*.tsx",
      "**/debug/**/*.ts",
      "**/debug/**/*.tsx",
      "**/__mocks__/**/*.ts",
      "**/__mocks__/**/*.tsx"
    ],

    rules: {
      "i18next/no-literal-string": "off"
    }
  }
]);
