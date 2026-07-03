"use strict";

const ignoredPathSegments = new Set([
  "__mocks__",
  "__test__",
  "__tests__",
  "___tests___"
]);
const ignoredFilePattern = /\.(spec|test)\.tsx?$/;

const isIgnoredFilename = filename =>
  filename !== "<input>" &&
  (ignoredFilePattern.test(filename) ||
    filename.split(/[\\/]/).some(segment => ignoredPathSegments.has(segment)));

// Note: only checks direct I18n.t(...) calls; track aliases if the codebase starts using them.
const isI18nTCall = node =>
  node.callee.type === "MemberExpression" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name === "I18n" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "t" &&
  !node.callee.computed;

const isStaticString = node =>
  (node?.type === "Literal" && typeof node.value === "string") ||
  (node?.type === "TemplateLiteral" && node.expressions.length === 0);

const isStaticKey = node =>
  isStaticString(node) ||
  (node?.type === "ConditionalExpression" &&
    isStaticKey(node.consequent) &&
    isStaticKey(node.alternate));

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Report dynamic I18n.t translation keys"
    },
    messages: {
      dynamicKey: "Use a static string as the first argument to I18n.t."
    },
    schema: []
  },

  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (isIgnoredFilename(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (!isI18nTCall(node)) {
          return;
        }

        const key = node.arguments[0];

        if (!isStaticKey(key)) {
          context.report({
            node: key ?? node,
            messageId: "dynamicKey"
          });
        }
      }
    };
  }
};
