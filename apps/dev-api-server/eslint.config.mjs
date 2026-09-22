import baseConfig from "../../eslint.config.mjs";
import { fileURLToPath } from "url";
import oxlint from "eslint-plugin-oxlint";

export default [
  ...baseConfig,
  // Must stay last: turns off every rule that oxlint already runs, so the two
  // linters never report the same problem.
  ...oxlint.buildFromOxlintConfigFile(
    fileURLToPath(new URL("./.oxlintrc.jsonc", import.meta.url)),
    { typeAware: true }
  )
];
