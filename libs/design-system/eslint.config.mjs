import baseConfig from "../../eslint.config.mjs";
import { fileURLToPath } from "url";
import oxlint from "eslint-plugin-oxlint";
import stylisticEslintPlugin from "@stylistic/eslint-plugin";
export default [
  ...baseConfig,
  {
    ignores: ["**/*.js", "**/*.cjs", "**/*.mjs", "lib/**"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@stylistic": stylisticEslintPlugin
    },
    rules: {
      // Unique design-system specific rules (all other rules inherited from root)
      "@stylistic/member-delimiter-style": [
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
      semi: "off",
      "@stylistic/semi": ["error"]
    }
  },
  {
    /* Exclude `Pictogram...` and `Icon...` SVG files from `perfectionist` rules
    because sorting them doesn't offer any benefit */
    files: [
      "src/components/icons/svg/**/*.tsx",
      "src/components/pictograms/svg/**/*.tsx"
    ],
    rules: {
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-named-imports": "off"
    }
  },
  // Must stay last: turns off every rule that oxlint already runs, so the two
  // linters never report the same problem.
  ...oxlint.buildFromOxlintConfigFile(
    fileURLToPath(new URL("./.oxlintrc.jsonc", import.meta.url)),
    { typeAware: true }
  )
];
