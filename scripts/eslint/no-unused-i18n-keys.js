"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "../..");
const appRoot = path.join(repoRoot, "apps/main-app");
const sourceRoot = path.join(appRoot, "ts");
const localePath = path.join(appRoot, "locales/it/index.json");

const ignoredPathSegments = new Set([
  "__mocks__",
  "__test__",
  "__tests__",
  "___tests___"
]);
const ignoredFilePattern = /\.(spec|test)\.tsx?$/;

let cachedResult;

const isInside = (child, parent) => {
  const relative = path.relative(parent, child);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
};

const isProductionSourceFile = filePath => {
  const absoluteFilePath = path.resolve(filePath);

  if (!isInside(absoluteFilePath, sourceRoot)) {
    return false;
  }

  const relative = path.relative(sourceRoot, absoluteFilePath);
  const segments = relative.split(path.sep);

  return (
    !absoluteFilePath.endsWith(".d.ts") &&
    !ignoredFilePattern.test(absoluteFilePath) &&
    segments.every(segment => !ignoredPathSegments.has(segment))
  );
};

const listProductionSourceFiles = dirPath =>
  fs.readdirSync(dirPath, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      return ignoredPathSegments.has(entry.name)
        ? []
        : listProductionSourceFiles(entryPath);
    }

    return /\.(ts|tsx)$/.test(entry.name) && isProductionSourceFile(entryPath)
      ? [entryPath]
      : [];
  });

const collectSourceLiterals = () => {
  const literals = new Set();

  for (const filePath of listProductionSourceFiles(sourceRoot)) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const visit = node => {
      // Exact literals only; interpolated keys are intentionally left unmatched
      // so they surface as warnings (we don't want dynamic i18n keys).
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)
      ) {
        literals.add(node.text);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return literals;
};

const getPropertyName = name =>
  ts.isStringLiteral(name) || ts.isIdentifier(name) ? name.text : undefined;

const collectLocaleKeys = () => {
  const sourceText = fs.readFileSync(localePath, "utf8");
  const sourceFile = ts.parseJsonText(localePath, sourceText);
  const rootExpression = sourceFile.statements[0]?.expression;
  const keys = [];

  const visitProperty = (property, parentPath) => {
    const name = getPropertyName(property.name);

    if (!name) {
      return;
    }

    const keyPath = parentPath ? `${parentPath}.${name}` : name;
    const initializer = property.initializer;

    if (ts.isObjectLiteralExpression(initializer)) {
      initializer.properties.forEach(childProperty =>
        visitProperty(childProperty, keyPath)
      );
      return;
    }

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      property.name.getStart(sourceFile)
    );

    keys.push({
      key: keyPath,
      loc: { line: line + 1, column: character }
    });
  };

  if (rootExpression && ts.isObjectLiteralExpression(rootExpression)) {
    rootExpression.properties.forEach(property => visitProperty(property, ""));
  }

  return keys;
};

// i18n-js appends a count suffix at runtime, so `foo_one` is reached via the
// base key `foo`. Strip it before comparing against source references.
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const findUnusedKeys = () => {
  const literals = collectSourceLiterals();

  const isUsed = key =>
    literals.has(key) || literals.has(key.replace(PLURAL_SUFFIX, ""));

  cachedResult = collectLocaleKeys().filter(({ key }) => !isUsed(key));
  return cachedResult;
};

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Report Italian i18n keys unused by production source files"
    },
    messages: {
      scanFailed: "Unable to check unused i18n keys: {{reason}}",
      unusedKey: 'unused i18n key "{{key}}"'
    },
    schema: []
  },

  create(context) {
    return {
      Program(node) {
        const filename = context.filename;

        if (path.resolve(filename) !== localePath) {
          return;
        }

        let unusedKeys;

        try {
          unusedKeys = findUnusedKeys();
        } catch (error) {
          context.report({
            node,
            messageId: "scanFailed",
            data: {
              reason: error instanceof Error ? error.message : String(error)
            }
          });
          return;
        }

        for (const { key, loc } of unusedKeys) {
          context.report({
            loc,
            node,
            messageId: "unusedKey",
            data: { key }
          });
        }
      }
    };
  }
};
