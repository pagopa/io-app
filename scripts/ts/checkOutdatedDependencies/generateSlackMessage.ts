import { anyOutdated, GroupBySeverity } from "./types/GroupBySeverity";
import { getTotalSeverity } from "./types/GroupByType";
import {
  compareByDeltaMajorVersion,
  getDeltaMajorVersion,
  OutdatedPackage,
  OutdatedStats
} from "./types/OutdatedStats";

const maxFirstColWidth = 20;
const maxColWidth = 10;

const tableCell = (text: string, maxWidth: number): string =>
  `${text}${" ".repeat(maxWidth - text.length)}`;

const tableRow = (name: string, severity: GroupBySeverity) =>
  anyOutdated(severity)
    ? tableCell(name, maxFirstColWidth) +
      tableCell(severity.major.toString(), maxColWidth) +
      tableCell(severity.minor.toString(), maxColWidth) +
      tableCell(severity.patch.toString(), maxColWidth) +
      tableCell(severity.unknown.toString(), maxColWidth) +
      "\n"
    : "";

const outdatedEmoji = [
  ":older_man:",
  ":spider_web:",
  ":older_woman:",
  ":older_adult:",
  ":male_zombie:",
  ":female_zombie:",
  ":fallen_leaf:",
  ":wilted_flower:",
  ":construction:",
  ":presidente:"
];

const getOutdatedSymbol = (outdated: OutdatedPackage): string => {
  const outdatedDelta = getDeltaMajorVersion(outdated);
  if (outdatedDelta >= 5) {
    return ":red_circle:";
  }
  if (outdatedDelta >= 4) {
    return ":large_orange_circle:";
  }
  return ":large_yellow_circle:";
};

/**
 * Generate a slack message from stats.
 * The message shows a table with the outdated dependencies type and severity, followed by a list of the most outdated dependencies.
 * The returned message is split in chunk, in order to avoid the slack API limit
 * @param stats
 */
export const generateSlackMessage = (
  stats: OutdatedStats
): ReadonlyArray<string> => {
  const { groupByType, mostOutdated } = stats;
  // Table header with the severity type
  const header =
    " ".repeat(maxFirstColWidth) +
    tableCell("Major", maxColWidth) +
    tableCell("Minor", maxColWidth) +
    tableCell("Patch", maxColWidth) +
    tableCell("Unknown", maxColWidth) +
    "\n";

  // Each row is a package type
  const table =
    "```" +
    header +
    tableRow("Dependencies", groupByType.dependencies) +
    tableRow("DevDependencies", groupByType.devDependencies) +
    tableRow("ResDependencies", groupByType.resolutionDependencies) +
    tableRow("Others", groupByType.others) +
    tableRow("Total", getTotalSeverity(groupByType)) +
    "```\n";

  // The most outdated dependencies, order by the most outdated
  const mostOutdatedLines = mostOutdated
    .concat()
    .sort(compareByDeltaMajorVersion)
    .map(
      x =>
        `${getOutdatedSymbol(x)} *${getDeltaMajorVersion(
          x
        )}* new major versions: <${x.url}|${x.name}> \`${
          x.currentVersion
        }\` -> \`${x.latestVersion}\``
    );

  const mostOutdatedSection =
    mostOutdatedLines.length > 0
      ? "*Most outdated packages:*\n" + mostOutdatedLines.join("\n")
      : "";

  return [
    outdatedEmoji[Math.floor(Math.random() * outdatedEmoji.length)] +
      " `yarn outdated` weekly report for :io-app: App:\n" +
      table,
    mostOutdatedSection
  ];
};
