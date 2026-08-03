// Compares a Knip report against the master baseline and posts the delta as a
// single, continuously updated PR comment.
//
// Only *new* findings are reported: anything already present on master is noise
// the PR author did not introduce, and stays silent.
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
        findings.set(
          id,
          scoped ? `\`${name}\` in \`${issue.file}\`` : `\`${name}\``
        );
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

const buildBody = ({
  added,
  removed,
  headFindings,
  baseFindings,
  hasBaseline
}) => {
  const heading = `${MARKER}\n### Unused code check\n\n`;

  if (!hasBaseline) {
    return (
      `${heading}` +
      `There was no baseline to compare against, so this branch could not be ` +
      `checked for code left unused. This resolves itself once the baseline ` +
      `has been recorded on \`master\`.\n`
    );
  }

  if (added.length === 0 && removed.length === 0) {
    return `${heading}No code was left unused by this branch.\n`;
  }

  let body = heading;

  if (added.length > 0) {
    body +=
      `[Knip](https://knip.dev) compared this branch against \`master\` and found ` +
      `**${added.length} ${added.length === 1 ? "item" : "items"} that nothing ` +
      `references any more**:\n\n`;
    for (const { key, label } of REPORTED_TYPES) {
      body += renderSection(
        `**${label}**`,
        added.filter(id => id.startsWith(`${key}:`)),
        headFindings
      );
    }
    body +=
      `Some of these may sit in files you never opened. Removing an import is ` +
      `all it takes to orphan whatever was on the other end of it.\n\n` +
      `If it is intentional (upcoming work, dynamic imports, codegen templates), ` +
      `ignore this comment.\n\n`;
  }

  if (removed.length > 0) {
    // "also" only reads correctly when a findings section precedes it.
    body += `This branch ${added.length > 0 ? "also " : ""}cleaned up **${
      removed.length
    } previously unused ${
      removed.length === 1 ? "item" : "items"
    }**. Thanks!\n\n`;
  }

  body += `<sub>Advisory only. This check never blocks a merge.</sub>\n`;
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
  // Quoting a comment on GitHub copies its raw markdown, marker included, so a
  // human reply can carry the marker too. Only ever edit our own comment.
  const existing = comments.find(
    comment => comment.user?.type === "Bot" && comment.body?.includes(MARKER)
  );

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

  // Without a baseline every finding counts as added, which would read as a
  // huge regression in the log even though the comment reports nothing.
  console.log(
    baseReport === undefined
      ? `no baseline to compare against (${headFindings.size} findings on this branch)`
      : `new: ${added.length}, resolved: ${removed.length}`
  );

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
