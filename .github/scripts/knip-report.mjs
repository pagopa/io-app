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
  { key: "files", emoji: "📄", label: "Unused files", scoped: false },
  { key: "exports", emoji: "↗️", label: "Unused exports", scoped: true },
  { key: "types", emoji: "🧩", label: "Unused exported types", scoped: true },
  // Knip nests this one: an array of symbol groups, not of single symbols.
  {
    key: "duplicates",
    emoji: "👯",
    label: "Duplicate exports",
    scoped: true,
    grouped: true
  }
];

const MAX_ITEMS_PER_SECTION = 20;

/**
 * Reads the symbol a Knip entry stands for.
 *
 * Grouped types carry the several symbols that share one binding; they are
 * sorted so that merely reordering those exports is not read as a new finding.
 */
const toSymbol = (entry, grouped) =>
  grouped
    ? entry
        .map(item => item?.name)
        .filter(Boolean)
        .sort()
        .join(", ")
    : (entry?.name ?? entry);

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
    for (const { key, scoped, grouped } of REPORTED_TYPES) {
      for (const entry of issue[key] ?? []) {
        const symbol = toSymbol(entry, grouped);
        if (!symbol) continue;
        const id = scoped
          ? `${key}:${issue.file}#${symbol}`
          : `${key}:${symbol}`;
        findings.set(
          id,
          scoped ? `\`${symbol}\` in \`${issue.file}\`` : `\`${symbol}\``
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

const renderList = (ids, findings) => {
  const shown = ids.slice(0, MAX_ITEMS_PER_SECTION);
  const rest = ids.length - shown.length;
  const lines = shown.map(id => `- ${findings.get(id)}`);
  if (rest > 0) lines.push(`- …and ${rest} more`);
  return `${lines.join("\n")}\n\n`;
};

const renderSection = (title, ids, findings) =>
  ids.length === 0 ? "" : `${title}\n\n${renderList(ids, findings)}`;

const buildBody = ({ added, removed, headFindings, baseFindings }) => {
  const heading = `${MARKER}\n### Unused code check\n\n`;
  const footer = `<sub>Advisory only. This check never blocks a merge. A renamed or moved item counts on both sides.</sub>\n`;

  if (added.length === 0 && removed.length === 0) {
    return `${heading}Everything this check flagged earlier is now clear.\n\n${footer}`;
  }

  let body = heading;

  if (added.length > 0) {
    body +=
      `[Knip](https://knip.dev) compared this branch against \`master\` and found ` +
      `**${added.length} ${added.length === 1 ? "item" : "items"} that nothing ` +
      `references any more**:\n\n`;
    for (const { key, emoji, label } of REPORTED_TYPES) {
      body += renderSection(
        `**${emoji} ${label}**`,
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
    // "Also" only reads correctly when a findings section precedes it.
    body +=
      `${added.length > 0 ? "Also, " : ""}**${removed.length} previously ` +
      `reported ${removed.length === 1 ? "item is" : "items are"} no longer ` +
      `flagged as unused**, having been either referenced or removed:\n\n` +
      renderList(removed, baseFindings);
  }

  body += footer;
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
 *
 * `createIfMissing` is false when there is nothing to report: an existing
 * comment still has to be corrected, but a PR that never had findings is left
 * alone rather than told that nothing happened.
 */
const upsertComment = async (repo, prNumber, body, createIfMissing) => {
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

  if (!createIfMissing) return;

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

  // A missing baseline is transient, so the last report already on the PR is
  // left standing rather than overwritten with a housekeeping notice.
  const baseReport = readReport(basePath);
  if (!baseReport) {
    console.log("No baseline to compare against, leaving the comment as is.");
    return;
  }

  const headFindings = toFindings(headReport);
  const baseFindings = toFindings(baseReport);

  const added = [...headFindings.keys()].filter(id => !baseFindings.has(id));
  const removed = [...baseFindings.keys()].filter(id => !headFindings.has(id));

  console.log(`new: ${added.length}, resolved: ${removed.length}`);

  const body = buildBody({ added, removed, headFindings, baseFindings });
  const hasFindingsToReport = added.length > 0 || removed.length > 0;

  await upsertComment(repo, prNumber, body, hasFindingsToReport);
};

// Never fail the build: this check is informational by design.
main().catch(error => {
  console.log(`Knip report skipped: ${error.message}`);
});
