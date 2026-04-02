/**
 * Local ESLint plugin for oxlint jsPlugins compatibility.
 *
 * Wraps core ESLint rules that are not yet natively implemented in oxlint
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
  rules: {
    "one-var": require(path.join(eslintRulesDir, "one-var")),
    "object-shorthand": require(path.join(eslintRulesDir, "object-shorthand")),
    "no-underscore-dangle": require(path.join(eslintRulesDir, "no-underscore-dangle")),
    "delegate-effects": delegateEffectsRule
  }
};
