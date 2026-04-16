const { defineConfig, globalIgnores } = require("eslint/config");

const { fixupConfigRules } = require("@eslint/compat");

const tseslint = require("typescript-eslint");
const reactNativeConfig = require("@react-native/eslint-config/flat");
const importPlugin = require("eslint-plugin-import");
const functional = require("eslint-plugin-functional");
const sonarjs = require("eslint-plugin-sonarjs");
const stylisticEslintPluginJs = require("@stylistic/eslint-plugin-js");
const i18Next = require("eslint-plugin-i18next");
const js = require("@eslint/js");
const prettierConfig = require("eslint-config-prettier");
const delegateEffectsRule = require("./scripts/eslint/delegate-effects.js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  globalIgnores([
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
    "locales/locales.ts",
    "ts/utils/__tests__/xss.test.ts",
    "definitions/*",
    "**/*.typegen.ts"
  ]),
  {
    files: "**/*.{ts,tsx}",
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...reactNativeConfig,
      ...fixupConfigRules(compat.extends("plugin:react-native-a11y/all")),
      prettierConfig
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
      import: importPlugin,
      functional,
      sonarjs,
      "@stylistic/js": stylisticEslintPluginJs,
      i18next: i18Next,
      "typed-redux-saga": { rules: { "delegate-effects": delegateEffectsRule } }
    },

    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "comma-dangle": ["error", "never"],
      "no-case-declarations": "off",
      "no-inner-declarations": "off",
      "prefer-const": "error",
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

      radix: "error",
      "one-var": ["error", "never"],
      "object-shorthand": "error",
      "no-var": "error",
      "no-param-reassign": "error",
      "no-underscore-dangle": "error",
      "no-undef-init": "error",
      "no-throw-literal": "error",
      "no-new-wrappers": "error",
      "no-eval": "error",
      "no-console": "error",
      "no-caller": "error",
      "no-bitwise": "error",
      "no-void": "off",
      "no-duplicate-imports": "error",
      quotes: "off",
      eqeqeq: ["error", "smart"],
      "max-classes-per-file": ["error", 1],
      "guard-for-in": "error",
      complexity: "error",
      "arrow-body-style": "error",
      "import/order": "error",
      "@typescript-eslint/no-unused-vars": "off",
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
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-explicit-any": "off",

      "@typescript-eslint/array-type": [
        "error",
        {
          default: "generic"
        }
      ],

      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/dot-notation": "error",

      "@typescript-eslint/no-floating-promises": "error",
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": ["error"],
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/unified-signatures": "error",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/jsx-key": "error",

      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true
        }
      ],

      "react/no-unstable-nested-components": [
        "off",
        {
          allowAsProps: true
        }
      ],

      "react/no-direct-mutation-state": "off",
      "react/require-render-return": "off",
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
      "sonarjs/no-small-switch": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-nested-template-literals": "warn",
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "off",
      "react-native/no-inline-styles": "off",
      "react-native/no-color-literals": "error",
      "react-native/no-raw-text": "off",
      "react-native/no-single-element-style-arrays": "warn",
      "react-native-a11y/has-accessibility-hint": "off",

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

      "typed-redux-saga/delegate-effects": "error",

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
    files: "**/*.test.{ts,tsx}",

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
      "**/design-system/**/*.{ts,tsx}",
      "**/playgrounds/**/*.{ts,tsx}",
      "**/devMode/**/*.{ts,tsx}",
      "**/debug/**/*.{ts,tsx}",
      "**/__mocks__/**/*.{ts,tsx}"
    ],

    rules: {
      "i18next/no-literal-string": "off"
    }
  }
]);
