import baseConfig from "../../eslint.config.mjs";
import { fileURLToPath } from "url";
import oxlint from "eslint-plugin-oxlint";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      // Consumers must use the public design-system API instead of its monorepo path or internals
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/libs/design-system/**", // Avoid monorepo path
                "@io-app/design-system/**" // Avoid internals
              ],
              message:
                'Import from "@io-app/design-system" to use the design system.'
            }
          ]
        }
      ]
    }
  },
  {
    ignores: [
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "locales/locales.ts",
      "ts/utils/__tests__/xss.test.ts",
      "definitions/*",
      "**/*.typegen.ts"
    ]
  },
  {
    // ESLint sees disables for rules moved to oxlint as unused, and `--fix`
    // would delete them although oxlint still needs them. oxlint reports its own.
    linterOptions: { reportUnusedDisableDirectives: "off" }
  },
  // Must stay last: turns off every rule that oxlint already runs, so the two
  // linters never report the same problem.
  ...oxlint.buildFromOxlintConfigFile(
    fileURLToPath(new URL("./.oxlintrc.jsonc", import.meta.url)),
    { typeAware: true }
  )
];
