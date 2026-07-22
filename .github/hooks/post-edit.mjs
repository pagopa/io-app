#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { readPayload } from "./shared.mjs";

const patchPaths = patch => {
  const paths = [];
  const pattern = /^\*\*\* (?:(?:Add|Update|Delete) File:|Move to:) (.+)$/gm;
  let match;

  while ((match = pattern.exec(patch)) !== null) {
    paths.push(match[1]);
  }

  return paths;
};

const extractEditedPaths = toolInput => {
  const paths = new Set();
  const pathKeys = new Set(["file", "filePath", "file_path", "path"]);
  const patchKeys = new Set(["patch", "patchText", "patch_text"]);

  const visit = (value, key) => {
    if (typeof value === "string") {
      if (pathKeys.has(key)) {
        paths.add(value);
      }
      if (patchKeys.has(key) || key === "") {
        patchPaths(value).forEach(path => paths.add(path));
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => visit(item, ""));
      return;
    }

    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) =>
        visit(childValue, childKey)
      );
    }
  };

  // ponytail: Parse known Copilot edit payloads; add adapters when new edit tools expose different shapes.
  visit(toolInput, "");
  return [...paths];
};

const toRepositoryPath = filePath => {
  const absolutePath = resolve(filePath);
  const repositoryPath = relative(process.cwd(), absolutePath);

  if (
    repositoryPath === ".." ||
    repositoryPath.startsWith(`..${sep}`) ||
    isAbsolute(repositoryPath)
  ) {
    return undefined;
  }

  return repositoryPath.split(sep).join("/");
};

const isPrettierFile = filePath =>
  /(^|\/)(src|ts|locales)\/.*\.(ts|tsx|json)$/.test(filePath);

const isEslintFile = filePath => /(^|\/)(src|ts)\/.*\.(ts|tsx)$/.test(filePath);

const payload = await readPayload();
const toolInput = payload.tool_input ?? payload.toolArgs;
const extractedPaths = extractEditedPaths(toolInput);

if (extractedPaths.length === 0) {
  throw new Error("No edited file paths found in Copilot hook payload");
}

const existingPaths = extractedPaths
  .map(toRepositoryPath)
  .filter(filePath => filePath && existsSync(filePath));
const prettierFiles = existingPaths.filter(isPrettierFile);
const eslintFiles = existingPaths.filter(isEslintFile);

if (prettierFiles.length > 0) {
  execFileSync("pnpm", ["exec", "prettier", "--write", ...prettierFiles], {
    stdio: "inherit"
  });
}
if (eslintFiles.length > 0) {
  execFileSync("pnpm", ["exec", "eslint", "--fix", "--cache", ...eslintFiles], {
    stdio: "inherit"
  });
}
