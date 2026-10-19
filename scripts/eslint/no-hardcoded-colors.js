/**
 * ESLint rule that warns on hardcoded color values (`#RRGGBB`, `rgb()`,
 * `rgba()`, `hsl()`, `hsla()`).
 *
 * A color is declared once in a module-level constant (`IOColorPalette`, or a
 * custom set for feature brands and third parties), then referenced by name.
 * Colors written inside components, functions, JSX or calls are hardcoded.
 *
 * Style objects are left to `react-native/no-color-literals`: a color there
 * can't follow dark mode either.
 *
 * Kept as a warning until the existing hardcoded colors are migrated.
 */

"use strict";

const COLOR = /^\s*(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i;

/* Same scope as `react-native/no-color-literals`: `StyleSheet.*` and `*style*` props */
const isStyle = node =>
  (node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.name === "StyleSheet") ||
  (node.type === "JSXAttribute" &&
    typeof node.name.name === "string" &&
    node.name.name.toLowerCase().includes("style"));

/* Nodes a color can't sit in: it would be built or applied, not declared */
const isUsage = node =>
  node.type === "CallExpression" ||
  node.type === "NewExpression" ||
  node.type === "ArrowFunctionExpression" ||
  node.type === "FunctionExpression" ||
  node.type === "FunctionDeclaration" ||
  node.type === "ClassBody" ||
  node.type.startsWith("JSX");

const isModuleConstant = node =>
  node.type === "VariableDeclarator" &&
  node.parent.kind === "const" &&
  (node.parent.parent.type === "Program" ||
    node.parent.parent.type === "ExportNamedDeclaration");

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow colors outside module-level constants"
    },
    messages: {
      hardcoded:
        "Hardcoded color '{{value}}': use `IOColorPalette`, a color token, or declare it in a module-level constant."
    },
    schema: []
  },

  create(context) {
    const check = (node, value) => {
      if (typeof value !== "string" || !COLOR.test(value)) {
        return;
      }
      const ancestors = context.sourceCode.getAncestors(node);
      if (
        ancestors.some(isStyle) ||
        (ancestors.some(isModuleConstant) && !ancestors.some(isUsage))
      ) {
        return;
      }
      context.report({
        node,
        messageId: "hardcoded",
        data: { value: value.trim() }
      });
    };

    return {
      Literal: node => check(node, node.value),
      // Only static templates: colors built from values (e.g. `withAlpha`) are fine
      "TemplateLiteral[expressions.length=0]": node =>
        check(node, node.quasis[0].value.cooked)
    };
  }
};
