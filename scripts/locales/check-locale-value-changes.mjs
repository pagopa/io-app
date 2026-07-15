#!/usr/bin/env node
// @ts-check

/**
 * Guards locale files against manual value changes.
 *
 * Business rule
 * -------------
 * Locale files under `apps/main-app/locales/**` are the source of truth that gets
 * synced with Lokalise. Contributors are allowed to:
 *   - add a brand new key
 *   - delete an unused key
 * but they are NOT allowed to change the *value* of an already existing key by hand.
 * Translations (i.e. value changes) may only land through the automated
 * `lokalise/lokalise-pull-action`, which opens PRs from a `lok_*` branch.
 *
 * This script compares the base revision of each tracked locale file with the
 * current working tree (head) and fails when the value of a key that exists in
 * both revisions has changed.
 *
 * Usage
 * -----
 *   node scripts/locales/check-locale-value-changes.mjs [--base <git-ref>]
 *
 * The base ref defaults to the `BASE_REF` env variable, then to `origin/master`.
 * Exit code is 1 when at least one forbidden value change is detected, 0 otherwise.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/** Root that contains every localized bundle we want to protect. */
const LOCALES_DIR = "apps/main-app/locales";

/**
 * Reads a CLI flag value (e.g. `--base origin/master`).
 * @param {string} flag
 * @returns {string | undefined}
 */
function readFlag(flag) {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

const baseRef = readFlag("--base") ?? process.env.BASE_REF ?? "origin/master";

/**
 * Runs a git command and returns its trimmed stdout.
 * @param {ReadonlyArray<string>} args
 * @returns {string}
 */
function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  }).trim();
}

/**
 * Returns the content of a file at a given git ref, or `null` when the file did
 * not exist at that revision (e.g. a newly added locale file).
 * @param {string} ref
 * @param {string} filePath
 * @returns {string | null}
 */
function readFileAtRef(ref, filePath) {
  try {
    return execFileSync("git", ["show", `${ref}:${filePath}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return null;
  }
}

/**
 * Flattens a nested JSON object into a map of `dot.path` -> stringified value.
 * Arrays are indexed (`key.0`, `key.1`). Leaf values are JSON-stringified so
 * that primitive comparisons are exact and type-aware.
 * @param {unknown} value
 * @param {string} prefix
 * @param {Map<string, string>} out
 * @returns {Map<string, string>}
 */
function flatten(value, prefix = "", out = new Map()) {
  if (value !== null && typeof value === "object") {
    const entries = Array.isArray(value)
      ? value.map((item, index) => [String(index), item])
      : Object.entries(value);
    for (const [key, child] of entries) {
      const path = prefix ? `${prefix}.${key}` : key;
      flatten(child, path, out);
    }
  } else {
    out.set(prefix, JSON.stringify(value));
  }
  return out;
}

/**
 * Detects keys whose value changed between two revisions of the same file.
 * Added and removed keys are intentionally ignored.
 * @param {string} baseContent
 * @param {string} headContent
 * @returns {Array<{ key: string; from: string; to: string }>}
 */
function findChangedValues(baseContent, headContent) {
  const base = flatten(JSON.parse(baseContent));
  const head = flatten(JSON.parse(headContent));

  /** @type {Array<{ key: string; from: string; to: string }>} */
  const changes = [];
  for (const [key, baseValue] of base) {
    if (!head.has(key)) {
      continue; // key removed -> allowed
    }
    const headValue = head.get(key);
    if (headValue !== baseValue) {
      changes.push({
        key,
        from: baseValue,
        to: /** @type {string} */ (headValue)
      });
    }
  }
  return changes;
}

function main() {
  // Make sure the base ref is available (shallow clones need this in CI).
  try {
    git(["cat-file", "-e", `${baseRef}^{commit}`]);
  } catch {
    console.error(
      `Base ref "${baseRef}" is not available. Fetch it before running this check ` +
        `(e.g. \`git fetch origin master\`).`
    );
    process.exit(2);
  }

  // Only inspect locale files that actually changed in this PR.
  const changedFiles = git([
    "diff",
    "--name-only",
    `${baseRef}...HEAD`,
    "--",
    LOCALES_DIR
  ])
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.endsWith(".json"));

  if (changedFiles.length === 0) {
    console.log("No locale file changes detected. Nothing to check.");
    return;
  }

  /** @type {Array<{ file: string; changes: Array<{ key: string; from: string; to: string }> }>} */
  const violations = [];

  for (const file of changedFiles) {
    const baseContent = readFileAtRef(baseRef, file);
    if (baseContent === null) {
      continue; // brand new locale file -> every key is an addition
    }
    const headContent = existsSync(file) ? git(["show", `HEAD:${file}`]) : null;
    if (headContent === null) {
      continue; // file deleted -> handled as removals
    }

    const changes = findChangedValues(baseContent, headContent);
    if (changes.length > 0) {
      violations.push({ file, changes });
    }
  }

  if (violations.length === 0) {
    console.log("✅ Locale check passed: only key additions/removals detected.");
    return;
  }

  console.error(
    "❌ Manual value changes to existing locale keys are not allowed.\n" +
      "   Existing translations can only be updated through the Lokalise pull\n" +
      "   automation (PRs opened from a `lok_*` branch).\n" +
      "   You may still add new keys or remove unused ones.\n"
  );
  for (const { file, changes } of violations) {
    console.error(`\n  ${file}`);
    for (const { key, from, to } of changes) {
      console.error(`    - ${key}\n        from: ${from}\n        to:   ${to}`);
    }
  }
  process.exit(1);
}

main();
