// Compares a Knip report against the master baseline and posts the delta as a
// single, continuously updated PR comment.
//
// Only *new* findings are reported: anything already present on master is noise
// the PR author did not introduce, and stays silent. This is what keeps the bot
// quiet enough to be worth reading, and it also absorbs known false positives
// (e.g. `jest.preset.js`, unreachable while @nx/jest cannot load the root jest
// config) without maintaining an ignore list.
//
// Advisory only: always exits 0. A mobile engineer has the final word.

import { readFileSync, existsSync } from "node:fs";

const MARKER = "<!-- knip-report -->";

// Issue types worth reporting. Dependency-level types are excluded on purpose:
// they are noisy and orthogonal to dead-code review.
const REPORTED_TYPES = [
  { key: "files", label: "Unused files", scoped: false },
  { key: "exports", label: "Unused exports", scoped: true },
  { key: "types", label: "Unused exported types", scoped: true },
  { key: "duplicates", label: "Duplicate exports", scoped: true }
];

const MAX_ITEMS_PER_SECTION = 20;

/**
 * Flattens a Knip JSON report into a map of stable identity → display label.
 *
 * Positions are deliberately excluded from the identity: a finding that merely
 * shifted line number is the same finding, and including it would report the
 * whole file as new every time something above it changes.
 */
const toFindings = report => {
  const findings = new Map();
  for (const issue of report?.issues ?? []) {
    for (const { key, scoped } of REPORTED_TYPES) {
      for (const entry of issue[key] ?? []) {
        const name = entry?.name ?? entry;
        if (!name) continue;
        const id = scoped ? `${key}:${issue.file}#${name}` : `${key}:${name}`;
        findings.set(id, scoped ? `\`${name}\` — \`${issue.file}\`` : `\`${name}\``);
      }
    }
  }
  return findings;
};

const readReport = path => {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
};

const renderSection = (title, ids, findings) => {
  if (ids.length === 0) return "";
  const shown = ids.slice(0, MAX_ITEMS_PER_SECTION);
  const rest = ids.length - shown.length;
  const lines = shown.map(id => `- ${findings.get(id)}`);
  if (rest > 0) lines.push(`- …and ${rest} more`);
  return `${title}\n\n${lines.join("\n")}\n\n`;
};

const buildBody = ({ added, removed, headFindings, baseFindings, hasBaseline }) => {
  if (!hasBaseline) {
    return (
      `${MARKER}\n### Knip\n\n` +
      `No master baseline was available for comparison, so this PR could not be ` +
      `checked for newly orphaned code. This resolves itself once the baseline ` +
      `workflow has run on \`master\`.\n`
    );
  }

  if (added.length === 0 && removed.length === 0) {
    return `${MARKER}\n### Knip\n\nNo change in unused code. ✅\n`;
  }

  let body = `${MARKER}\n### Knip\n\n`;

  if (added.length > 0) {
    body +=
      `This PR appears to have left **${added.length} new unused ` +
      `${added.length === 1 ? "item" : "items"}** behind:\n\n`;
    for (const { key, label } of REPORTED_TYPES) {
      body += renderSection(
        `**${label}**`,
        added.filter(id => id.startsWith(`${key}:`)),
        headFindings
      );
    }
    body +=
      `A file can become unused without appearing in the diff — removing its ` +
      `last import is enough. If these are intentional (upcoming work, dynamic ` +
      `imports, codegen templates), ignore this comment.\n\n`;
  }

  if (removed.length > 0) {
    body += `Also cleaned up **${removed.length} previously unused ${
      removed.length === 1 ? "item" : "items"
    }**. Thanks! 🧹\n\n`;
  }

  body += `<sub>Advisory only — never blocks the merge.</sub>\n`;
  return body;
};

const github = async (path, init = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      ...init.headers
    }
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${response.status}`);
  }
  return response.json();
};

/**
 * Edits the previous Knip comment when one exists so the PR thread keeps a
 * single, always-current entry instead of one comment per push.
 */
const upsertComment = async (repo, prNumber, body) => {
  const comments = await github(
    `/repos/${repo}/issues/${prNumber}/comments?per_page=100`
  );
  const existing = comments.find(comment => comment.body?.includes(MARKER));

  if (existing) {
    await github(`/repos/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body })
    });
    return;
  }

  await github(`/repos/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
};

const main = async () => {
  const [headPath, basePath] = process.argv.slice(2);
  const { GITHUB_REPOSITORY: repo, PR_NUMBER: prNumber } = process.env;

  const headReport = readReport(headPath);
  if (!headReport) {
    console.log("No Knip report for this PR, nothing to do.");
    return;
  }

  const baseReport = readReport(basePath);
  const headFindings = toFindings(headReport);
  const baseFindings = toFindings(baseReport ?? { issues: [] });

  const added = [...headFindings.keys()].filter(id => !baseFindings.has(id));
  const removed = [...baseFindings.keys()].filter(id => !headFindings.has(id));

  console.log(`new: ${added.length}, resolved: ${removed.length}`);

  const body = buildBody({
    added,
    removed,
    headFindings,
    baseFindings,
    hasBaseline: baseReport !== undefined
  });

  await upsertComment(repo, prNumber, body);
};

// Never fail the build: this check is informational by design.
main().catch(error => {
  console.log(`Knip report skipped: ${error.message}`);
});
