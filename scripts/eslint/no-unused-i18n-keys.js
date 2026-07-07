/**
 * ESLint rule that reports Italian locale keys unused by production code.
 *
 * The Italian locale is the canonical source for app copy. Reporting dead keys
 * directly on `locales/it/index.json` keeps translation cleanup incremental and
 * exposes places where dynamic i18n keys hide real usage from static analysis.
 *
 * Performance: linting the locale file forces a full scan of the `ts/` tree,
 * which the long-lived ESLint server in an IDE re-runs on every keystroke.
 * Parsed keys are cached per file by mtime (see `fileLiteralsCache`) so only
 * changed files are re-read/parsed; steady-state re-lints just walk + stat.
 *
 * Known limitation: under `eslint --cache` the locale file's cached result is
 * keyed on its own contents, but this rule depends on every source file. If a
 * `I18n.t` usage is removed without touching the locale file, the newly-unused
 * key is only reported once the locale file itself changes (or the cache is
 * cleared). Full `eslint .` and CI runs are unaffected.
 */

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

// Per-file cache of static I18n.t keys, keyed by mtime. The ESLint server is
// long-lived in IDEs and re-lints the locale file on every edit; without this
// each re-lint re-reads and TypeScript-parses the whole ts/ tree (~600ms).
// ponytail: the tree is still re-walked each run (~65ms). Add directory-watch
// invalidation only if that shows up in a profile.
const fileLiteralsCache = new Map();

const parseFileLiterals = (filePath, sourceText) => {
  const literals = [];

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const addStaticKeys = expr => {
    if (!expr) {
      return;
    }

    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      literals.push(expr.text);
      return;
    }

    if (ts.isConditionalExpression(expr)) {
      addStaticKeys(expr.whenTrue);
      addStaticKeys(expr.whenFalse);
    }
  };

  const visit = node => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "I18n" &&
      node.expression.name.text === "t"
    ) {
      addStaticKeys(node.arguments[0]);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return literals;
};

const getFileLiterals = filePath => {
  const { mtimeMs } = fs.statSync(filePath);
  const cached = fileLiteralsCache.get(filePath);

  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.literals;
  }

  const sourceText = fs.readFileSync(filePath, "utf8");
  // `I18n` is the only identifier we collect calls on, so files that never
  // mention it cannot contribute keys — skip the expensive TypeScript parse.
  const literals = sourceText.includes("I18n")
    ? parseFileLiterals(filePath, sourceText)
    : [];

  fileLiteralsCache.set(filePath, { mtimeMs, literals });

  return literals;
};

const collectSourceLiterals = () => {
  const literals = new Set();

  for (const filePath of listProductionSourceFiles(sourceRoot)) {
    for (const key of getFileLiterals(filePath)) {
      literals.add(key);
    }
  }

  return literals;
};

const getPropertyName = name =>
  ts.isStringLiteral(name) || ts.isIdentifier(name) ? name.text : undefined;

const collectLocaleKeys = () => {
  const sourceText = fs.readFileSync(localePath, "utf8");
  const sourceFile = ts.parseJsonText(localePath, sourceText);
  if (sourceFile.parseDiagnostics.length > 0) {
    throw new Error(
      ts.flattenDiagnosticMessageText(
        sourceFile.parseDiagnostics[0].messageText,
        "\n"
      )
    );
  }
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

    // Report the full `"key": value` span so editors underline the whole
    // property. A flat `{ line, column }` has no end position, which makes
    // ESLint/VS Code highlight only the first character.
    const start = sourceFile.getLineAndCharacterOfPosition(
      property.getStart(sourceFile)
    );
    const end = sourceFile.getLineAndCharacterOfPosition(property.getEnd());

    keys.push({
      key: keyPath,
      loc: {
        start: { line: start.line + 1, column: start.character },
        end: { line: end.line + 1, column: end.character }
      }
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

  return collectLocaleKeys().filter(({ key }) => !isUsed(key));
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
