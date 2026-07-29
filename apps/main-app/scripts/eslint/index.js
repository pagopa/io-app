/**
 * Local ESLint plugin exposing the project's custom rules so they can run via
 * oxlint jsPlugins. None of these rules has a native oxlint equivalent.
 */

"use strict";

const delegateEffects = require("./delegate-effects.js");
const i18nNoDynamicKeys = require("./no-dynamic-i18n-keys.js");

module.exports = {
  meta: {
    name: "io-app"
  },
  rules: {
    "delegate-effects": delegateEffects,
    "i18n-no-dynamic-keys": i18nNoDynamicKeys
  }
};
