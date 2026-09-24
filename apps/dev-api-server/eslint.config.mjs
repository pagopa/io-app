import baseConfig from "../../eslint.config.mjs";
import { fileURLToPath } from "url";
import oxlint from "eslint-plugin-oxlint";

export default [
  ...baseConfig,
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
