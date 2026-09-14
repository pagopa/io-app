/**
 * ESLint rule that warns when a file imports from `fp-ts`.
 *
 * Remove this rule once the migration is complete.
 * 
 * The codebase is migrating from `fp-ts` to `neverthrow`. 
 * This rule doesn't block imports (kept as a warning) but nudges authors of new/touched code
 * towards the replacement, with a quick-reference mapping in the message.
 */

"use strict";

const MIGRATION_HINTS = {
  Either: "neverthrow's Result (ok/err, map/mapErr, andThen, match)",
  TaskEither: "neverthrow's ResultAsync (fromPromise, map/mapErr, andThen)",
  Option:
    "native `T | undefined` checks, or neverthrow's Result with a `NotFoundError`-like err",
  pipeable: "native method chaining (.map/.andThen/...) on Result/ResultAsync",
  function: "native arrow functions / `pipe` is not needed with method chaining"
};

const hintFor = moduleName => {
  const segments = moduleName.split("/");
  const subModule = segments[1] === "lib" ? segments[2] : segments[1];
  return (
    MIGRATION_HINTS[subModule] ??
    "neverthrow (see the migration guide for the closest equivalent)"
  );
};

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Warn on fp-ts imports and suggest the neverthrow equivalent"
    },
    messages: {
      migrate:
        "Refactor with neverthrow instead of fp-ts: replace '{{source}}' with {{hint}}."
    },
    schema: []
  },

  create(context) {
    const checkSource = node => {
      const source = node.source.value;
      if (source === "fp-ts" || source.startsWith("fp-ts/")) {
        context.report({
          node,
          messageId: "migrate",
          data: { source, hint: hintFor(source) }
        });
      }
    };

    return {
      ImportDeclaration: checkSource,
      ImportAllDeclaration: checkSource,
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkSource(node);
        }
      }
    };
  }
};
