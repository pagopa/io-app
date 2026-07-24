#!/usr/bin/env node

/**
 * Validates the worktree when the main agent tries to finish a turn.
 *
 * Clean worktrees are allowed immediately. Changed worktrees run the repository
 * Prettier check plus affected lint and type-check targets. Failures block
 * completion and return a concise file list with commands the agent must rerun
 * after fixing issues. Tests are intentionally excluded because the full suite
 * is too slow.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

import { readPayload } from "./shared.mjs";

const MAX_OUTPUT_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 20;

const git = (args, options = {}) =>
  execFileSync("git", args, {
    maxBuffer: MAX_OUTPUT_SIZE,
    ...options
  });

const runCheck = (name, args, rerun) => {
  try {
    return {
      name,
      output: execFileSync("pnpm", args, {
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
        maxBuffer: MAX_OUTPUT_SIZE,
        stdio: ["ignore", "pipe", "pipe"]
      }),
      rerun,
      success: true
    };
  } catch (error) {
    return {
      name,
      output: `${error.stdout ?? ""}\n${error.stderr ?? ""}`,
      rerun,
      success: false
    };
  }
};

const repositoryPaths = candidate => {
  const normalizedPath = candidate
    .replace(`${process.cwd()}/`, "")
    .replace(/^\.\//, "");

  if (
    normalizedPath.startsWith("apps/") ||
    normalizedPath.startsWith("libs/")
  ) {
    return [normalizedPath];
  }

  return [
    `apps/main-app/${normalizedPath}`,
    `libs/design-system/${normalizedPath}`
  ].filter(filePath => existsSync(filePath));
};

const filesFromOutput = failure => {
  const cleanOutput = failure.output
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "")
    .replaceAll(`${process.cwd()}/`, "");
  const files = new Set();
  const filePattern =
    /^(?:(?:apps\/main-app|libs\/design-system)\/)?(?:src|ts|locales)\/[^\s:()]+\.(?:[cm]?[jt]sx?|json)$/;

  if (failure.name === "Prettier") {
    cleanOutput.split("\n").forEach(line => {
      const match = line.match(/^\[warn\]\s+(.+\.(?:[cm]?[jt]sx?|json))$/);
      if (match) {
        repositoryPaths(match[1]).forEach(filePath => files.add(filePath));
      }
    });
    return [...files];
  }

  let currentFiles = [];
  cleanOutput.split("\n").forEach(line => {
    const trimmedLine = line.trim();

    if (filePattern.test(trimmedLine)) {
      currentFiles = repositoryPaths(trimmedLine);
      return;
    }

    if (/^\d+:\d+\s+error\s+/.test(trimmedLine)) {
      currentFiles.forEach(filePath => files.add(filePath));
      return;
    }

    const typeScriptMatch = trimmedLine.match(
      /^(.+\.(?:ts|tsx))\(\d+,\d+\):\s+error\s+TS\d+:/
    );
    if (typeScriptMatch) {
      repositoryPaths(typeScriptMatch[1]).forEach(filePath =>
        files.add(filePath)
      );
    }
  });

  return [...files];
};

const failureSummary = failures => {
  const sections = failures.map(failure => {
    const files = filesFromOutput(failure);
    const visibleFiles = files.slice(0, MAX_FILES);
    const remainingFiles = files.length - visibleFiles.length;
    const fileSummary =
      visibleFiles.length > 0
        ? [
            ...visibleFiles.map(filePath => `- ${filePath}`),
            ...(remainingFiles > 0 ? [`- ...and ${remainingFiles} more`] : [])
          ].join("\n")
        : "- No file paths parsed; rerun command for details.";

    return `${failure.name} failed:\n${fileSummary}\nRun: \`${failure.rerun}\``;
  });

  return [
    "Validation failed. Fix these issues before considering the task complete.",
    ...sections
  ].join("\n\n");
};

const respond = response => {
  process.stdout.write(JSON.stringify(response));
};

try {
  await readPayload();

  const status = git(["status", "--porcelain=v1", "--untracked-files=all"], {
    encoding: "utf8"
  });

  if (!status.trim()) {
    respond({ decision: "allow" });
  } else {
    const checks = [
      runCheck("Prettier", ["prettier:check"], "pnpm prettier:check"),
      runCheck(
        "Lint and type-check",
        [
          "nx",
          "affected",
          "--targets=lint,tsc-noemit",
          "--configuration=ci",
          "--nx-bail"
        ],
        "pnpm nx affected --targets=lint,tsc-noemit --configuration=ci --nx-bail"
      )
    ];
    const failures = checks.filter(check => !check.success);

    if (failures.length > 0) {
      respond({
        decision: "block",
        reason: failureSummary(failures)
      });
    } else {
      respond({ decision: "allow" });
    }
  }
} catch (error) {
  respond({
    decision: "block",
    reason: `Validation hook failed: ${error.message}. Fix the hook or environment before considering the task complete.`
  });
}
