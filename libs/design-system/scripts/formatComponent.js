const { join } = require("path");
const fs = require("fs-extra");

/* Reuse the repo-wide config so generated components already match `pnpm format`. */
const oxfmtOptions = fs.readJsonSync(join(__dirname, "../../../.oxfmtrc.json"));
delete oxfmtOptions.$schema;

/**
 * Formats a generated asset component with oxfmt, using the repo-wide config.
 * `fileName` drives language detection (e.g. `.tsx`). `oxfmt` is ESM-only,
 * hence the dynamic import from these CommonJS scripts.
 */
const formatComponent = async (fileName, sourceText) => {
  const { format } = await import("oxfmt");
  const { code } = await format(fileName, sourceText, oxfmtOptions);
  return code;
};

module.exports = { formatComponent };
