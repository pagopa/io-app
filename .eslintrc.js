module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native-a11y/all",
    "plugin:sonarjs/recommended",
    "prettier",
    "@react-native"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-native",
    "react-hooks",
    "import",
    "functional",
    "sonarjs",
    "@jambit/typed-redux-saga",
    "@stylistic/eslint-plugin-js",
    "i18next"
  ],
  rules: {
    //Rules from react 17 https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "comma-dangle": ["error", "never"],
    "no-case-declarations": "off",
    "no-inner-declarations": "off",
    "prefer-const": "error",
    curly: "error",
    "spaced-comment": ["error", "always", { block: { balanced: true } }],
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
    // Enable if we want to enforce the return type for all the functions
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    // TODO: added for compatibility. Removing this line we have to remove all the any usage in the code
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
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true
        },
        singleline: {
          delimiter: "semi",
          requireLast: false
        }
      }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": ["error"],
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/restrict-plus-operands": "error",
    semi: "off",
    "@typescript-eslint/semi": ["error"],
    "@typescript-eslint/unified-signatures": "error",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/jsx-key": "error",
    "react/jsx-no-bind": ["error", { allowArrowFunctions: true }],
    "react/no-unstable-nested-components": [
      "off",
      {
        allowAsProps: true
      }
    ],
    "react/no-direct-mutation-state": "off",
    "react/require-render-return": "off",
    "functional/no-let": "error",
    "functional/immutable-data": "error",
    "sonarjs/no-small-switch": "off",
    "sonarjs/no-duplicate-string": "off",
    "sonarjs/no-nested-template-literals": "warn",
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "off",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "error",
    "react-native/no-raw-text":
      "off" /* Error when you launch the lint command */,
    "react-native/no-single-element-style-arrays": "warn",
    /* Too much verbose. It also requires a lot of effort in the main repo */
    "react-native-a11y/has-accessibility-hint": "off",
    /* Prevents hardcoded strings in JSX. All user-facing text must use i18n (e.g. I18n.t("key")).
     * - mode "jsx-only": checks text inside JSX elements and string literals in JSX expressions
     *   (e.g. <Body>Hello</Body> and <Body>{condition ? "Hello" : "World"}</Body>)
     * - jsx-attributes.include: also enforces i18n on user-facing attributes (a11y labels, placeholders, etc.)
     * - jsx-components.exclude: skips <Trans> since it already handles translations via react-i18next
     * - words.exclude: ignores non-translatable patterns:
     *     "\\s+"                          → whitespace-only strings
     *     "[0-9!-/:-@\\[-`{-~]+"          → numbers, punctuation, and special characters
     *     "[•·]+"                         → masking dots used for card numbers (e.g. "•••• 1234")
     *     "."                             → single-character strings like unit suffixes (e.g. "s" in "{count}s")
     * - object-properties.exclude: testID values are test identifiers, not user-facing text
     * Excluded areas (see overrides): design-system, playgrounds, devMode, debug, __mocks__, test files */
    "i18next/no-literal-string": [
      "error",
      {
        mode: "jsx-only",
        "jsx-attributes": {
          include: ["accessibilityLabel", "accessibilityHint", "placeholder", "title", "alt"],
          exclude: []
        },
        "jsx-components": {
          include: [],
          exclude: ["Trans"]
        },
        words: {
          exclude: [
            "\\s+",
            "[0-9!-/:-@\\[-`{-~]+",
            "[•·]+",
            "."
          ]
        },
        "object-properties": {
          include: [],
          exclude: ["testID"]
        }
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
          }
        ]
      }
    ]
  },
  env: {
    "react-native/react-native": true
  },
  overrides: [
    {
      files: ["**/*.test.*"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "i18next/no-literal-string": "off"
      }
    },
    /* Hardcoded strings are allowed in these areas since they contain
     * showcase/demo screens, dev-only tools, and test fixtures — not user-facing content */
    {
      files: [
        "**/design-system/**",
        "**/playgrounds/**",
        "**/devMode/**",
        "**/debug/**",
        "**/__mocks__/**"
      ],
      rules: {
        "i18next/no-literal-string": "off"
      }
    },
    {
      files: ["./**/*.ts"],
      excludedFiles: ["./**/*.test.ts"],
      rules: {
        "@jambit/typed-redux-saga/use-typed-effects": ["error", "macro"],
        "@jambit/typed-redux-saga/delegate-effects": "error"
      }
    }
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};
