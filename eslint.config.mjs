import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pagopaConfig from "@pagopa/eslint-config/jest";
import tseslint from "typescript-eslint";
import reactNativeConfig from "@react-native/eslint-config/flat";
import importPlugin from "eslint-plugin-import";
import functional from "eslint-plugin-functional";
import sonarjs from "eslint-plugin-sonarjs";
import i18Next from "eslint-plugin-i18next";
import js from "@eslint/js";
import delegateEffectsRule from "./scripts/eslint/delegate-effects.js";
import noDynamicI18nKeysRule from "./scripts/eslint/no-dynamic-i18n-keys.js";
import noUnusedI18nKeysRule from "./scripts/eslint/no-unused-i18n-keys.js";
import jsonParser from "./scripts/eslint/json-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

// @typescript-eslint and jest are already registered by pagopaConfig (via
// typescript-eslint and @pagopa/eslint-config/jest, the latter scoping jest to
// test files). Strip the plugins — and jest's now-orphaned rules, which the RN
// config applies globally — to avoid "Cannot redefine plugin" errors.
const reactNativeSanitizedConfig = reactNativeConfig.map(config => {
  if (!config.plugins?.["@typescript-eslint"] && !config.plugins?.jest) {
    return config;
  }
  const {
    "@typescript-eslint": _tsRemoved,
    jest: _jestRemoved,
    ...plugins
  } = config.plugins;
  const rules = Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(
      ([rule]) => !rule.startsWith("jest/")
    )
  );
  return { ...config, plugins, rules };
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
  ...pagopaConfig,

  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      js.configs.recommended,
      // Only include rules from tseslint, not the plugin registration,
      // because @react-native/eslint-config/flat already registers @typescript-eslint
      ...tseslint.configs.recommended.filter(c => !c.plugins),
      ...reactNativeSanitizedConfig,
      ...fixupConfigRules(compat.extends("plugin:react-native-a11y/all"))
    ],

    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",

      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,

        ecmaFeatures: {
          jsx: true
        }
      }
    },

    plugins: {
      // `import` plugin is retained for `import/no-extraneous-dependencies`;
      // import ordering is handled by `perfectionist/sort-imports`.
      import: importPlugin,
      functional,
      sonarjs,
      i18next: i18Next,
      "@io-app": { rules: { "i18n-no-dynamic-keys": noDynamicI18nKeysRule } },
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

      // Allow `_`-prefixed throwaways and rest-sibling destructuring omits
      // (`const { key, ...rest } = obj`), matching tsc's own noUnusedLocals.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],

      // Rules from tseslint.strict / pagopa config that require widespread
      // refactoring incompatible with the current codebase
      "max-lines-per-function": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // Incorrectly fires on mapped types (`[P in ...]`) — only meant for
      // plain index signatures (`[key: string]: V`) which should use Record<K,V>
      "@typescript-eslint/consistent-indexed-object-style": "off",

      // Most violations are `typesafe-actions` empty payloads
      // (`createStandardAction("X")<void>()`, `createAsyncAction(...)<void, S, F>()`).
      // `void` here is load-bearing: it makes the action creator callable with no
      // argument while keeping a `payload` slot. Re-enabling requires a deliberate
      // action-shape refactor, not a mechanical fix.
      "@typescript-eslint/no-invalid-void-type": "off",

      // Widespread, deliberate test patterns from pagopa's jest config that
      // would require refactoring the whole test suite to satisfy:
      // - narrowing fp-ts Either/Option before asserting inside the guard
      "jest/no-conditional-expect": "off",
      // - importing shared fixtures directly from __mocks__ directories
      "jest/no-mocks-import": "off",
      // - asserting a mock was called without pinning its exact arguments
      "jest/prefer-called-with": "off",

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
      // Import ordering is handled by `perfectionist/sort-imports`

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
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowNullableBoolean: true,
          allowNullableString: true
        }
      ],

      // REACT
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-constructed-context-values": "error",
      // Less relevant rule with contemporary React with hooks
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true
        }
      ],
      // It could highlight performance issues,
      // with some noise on trivial cases
      "react/no-unstable-nested-components": "off",
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
          ],
          // Caches and memoization rely on mutable Map/Set
          ignoreMapsAndSets: true
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

      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false
        }
      ],

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
      ],

      // Disallow dynamically-built i18n keys so unused-key detection stays reliable
      "@io-app/i18n-no-dynamic-keys": "warn"
    },

    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/{__tests__,__mocks__}/**/*.{ts,tsx}"],

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-function": "off",
      "i18next/no-literal-string": "off",
      "no-restricted-imports": "off",
      "react/jsx-no-constructed-context-values": "off"
    }
  },
  {
    // Data-driven tests here derive titles dynamically (loop variables,
    // `fn.name`, ternaries). Allow non-string titles while keeping the
    // empty/whitespace/duplicate-prefix checks active. Scoped to `.ts` test
    // files only: `jest/valid-title` is an active rule and pagopa's config
    // only registers the jest plugin for `.{js,ts}` test files, not `.tsx`.
    files: ["**/*.test.ts", "**/__tests__/**/*.ts"],

    rules: {
      "jest/valid-title": [
        "error",
        {
          ignoreTypeOfDescribeName: true,
          ignoreTypeOfTestName: true
        }
      ],
      // Saga tests assert through redux-saga-test-plan's chainable APIs
      // (`testSaga(...).next()`, `expectSaga(...).run()`) rather than a bare
      // `expect`, so teach the rule to treat those as assertion helpers.
      "jest/expect-expect": [
        "warn",
        {
          assertFunctionNames: ["expect", "expectSaga", "testSaga"]
        }
      ]
    }
  },
  {
    files: [
      "**/{design-system,playgrounds,devMode,debug,__mocks__}/**/*.{ts,tsx}"
    ],

    rules: {
      "i18next/no-literal-string": "off"
    }
  },
  {
    files: ["**/locales/it/index.json"],
    languageOptions: {
      parser: jsonParser
    },
    plugins: {
      "@io-app": {
        rules: { "i18n-no-unused-keys": noUnusedI18nKeysRule }
      }
    },
    rules: {
      "@io-app/i18n-no-unused-keys": "warn"
    }
  }
]);
