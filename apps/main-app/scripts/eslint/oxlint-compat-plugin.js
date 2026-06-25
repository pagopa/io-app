/**
 * Local ESLint plugin for oxlint jsPlugins compatibility.
 *
 * Wraps the core ESLint `one-var` rule (not yet natively implemented in oxlint)
 * and the custom delegate-effects rule so they can run via jsPlugins.
 */

"use strict";

const path = require("path");
const delegateEffectsRule = require("./delegate-effects.js");

const eslintRulesDir = path.join(
  path.dirname(require.resolve("eslint/package.json")),
  "lib",
  "rules"
);

module.exports = {
  meta: {
    name: "oxlint-compat"
  },
  rules: {
    "one-var": require(path.join(eslintRulesDir, "one-var")),
    "delegate-effects": delegateEffectsRule
  }
};
