module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:sonarjs/recommended",
    "prettier"
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
    "@jambit/typed-redux-saga"
  ],
  rules: {
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
    "no-duplicate-imports": "error",
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
    "react-native/no-single-element-style-arrays": "warn"
  },
  env: {
    "react-native/react-native": true
  },
  overrides: [
    {
      files: ["**/*.test.*"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off"
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
