/**
 * Custom ESLint rule: delegate-effects
 *
 * Enforces `yield*` (delegation) over `yield` when calling effects
 * imported from "typed-redux-saga/macro". Using plain `yield` returns `any`,
 * losing type safety, while `yield*` preserves the return type.
 *
 * Replaces @jambit/eslint-plugin-typed-redux-saga/delegate-effects.
 */

"use strict";

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Enforce `yield*` over `yield` for typed-redux-saga effects',
    },
    fixable: "code",
    messages: {
      useYieldStar:
        'Use `yield*` instead of `yield` when calling typed-redux-saga effects to preserve type safety.',
    },
    schema: [],
  },

  create(context) {
    // Set of local names imported from "typed-redux-saga/macro"
    const trackedEffects = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== "typed-redux-saga/macro") {
          return;
        }
        for (const specifier of node.specifiers) {
          if (
            specifier.type === "ImportSpecifier" ||
            specifier.type === "ImportDefaultSpecifier"
          ) {
            trackedEffects.add(specifier.local.name);
          }
        }
      },

      YieldExpression(node) {
        // Only flag plain `yield`, not `yield*`
        if (node.delegate) {
          return;
        }

        const arg = node.argument;
        if (arg?.type !== "CallExpression") {
          return;
        }

        const callee = arg.callee;
        let name;

        if (callee.type === "Identifier") {
          name = callee.name;
        } else if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier"
        ) {
          name = callee.object.name;
        }

        if (name && trackedEffects.has(name)) {
          context.report({
            node,
            messageId: "useYieldStar",
            fix(fixer) {
              const sourceCode = context.sourceCode ?? context.getSourceCode();
              const yieldToken = sourceCode.getFirstToken(node);
              // Replace "yield" with "yield*"
              return fixer.replaceText(yieldToken, "yield*");
            },
          });
        }
      },
    };
  },
};
