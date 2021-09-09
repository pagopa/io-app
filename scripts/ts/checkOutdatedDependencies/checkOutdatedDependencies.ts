/* eslint-disable no-console */
import { exec } from "child_process";
import * as util from "util";
import { readableReport } from "italia-ts-commons/lib/reporters";
import * as semver from "semver";
import { slackPostMessage } from "../common/slack/postMessage";
import {
  anyOutdated,
  DependenciesTable,
  getDependencyType,
  getSeverityType,
  getTotalSeverity,
  GroupBySeverity,
  GroupByType,
  OutdatedPackage,
  OutdatedStats
} from "./types";

const execAsync = util.promisify(exec);

const majorVersionDeltaWarning = 3;

const initSeverityByType: GroupBySeverity = {
  major: 0,
  minor: 0,
  patch: 0,
  unknown: 0
};
const initGroupByType: GroupByType = {
  dependencies: initSeverityByType,
  devDependencies: initSeverityByType,
  resolutionDependencies: initSeverityByType,
  others: initSeverityByType
};

const increaseAmount = (
  value: GroupByType,
  type: keyof GroupByType,
  severity: keyof GroupBySeverity
) => ({
  ...value,
  [type]: {
    ...value[type],
    [severity]: value[type][severity] + 1
  }
});

/**
 * Execute the command "yarn outdated --json" and return the results as JSON any
 */
const readOutdatedJson = async (): Promise<any> => {
  try {
    const std = await execAsync("yarn outdated --json");
    return JSON.parse(std.stdout.split("\n")[1]);
  } catch (error) {
    // When the command finds outdated packages, return with exit code 1
    if (error.code === 1) {
      return JSON.parse(error.stdout.split("\n")[1]);
    } else {
      throw new Error(
        `Error ${error.code} while executing 'yarn outdated --json': ${error.message}`
      );
    }
  }
};

const toOutdatedPackage = (row: ReadonlyArray<string>): OutdatedPackage => ({
  type: row[4],
  name: row[0],
  url: row[5],
  currentVersion: row[1],
  latestVersion: row[3]
});

/**
 * Transform the raw structure {@link DependenciesTable} representing the JSON to {@link GroupByType} aggregated stats
 * @param deps
 */
const extractGroupByType = (deps: DependenciesTable): OutdatedStats =>
  deps.data.body.reduce<OutdatedStats>(
    (acc, val) => {
      const currentType = getDependencyType(val[4]);
      try {
        const currentSeverity = getSeverityType(semver.diff(val[1], val[3]));
        const currentMajor = semver.major(val[1]);
        const latestMajor = semver.major(val[3]);
        if (latestMajor - currentMajor >= majorVersionDeltaWarning) {
          console.log(val[0]);
          console.log(latestMajor - currentMajor);
        }
        return {
          groupByType: increaseAmount(
            acc.groupByType,
            currentType,
            currentSeverity
          ),
          mostOutdated:
            latestMajor - currentMajor >= majorVersionDeltaWarning
              ? [...acc.mostOutdated, toOutdatedPackage(val)]
              : acc.mostOutdated
        };
      } catch (e) {
        if (e.name === "TypeError") {
          // We use some packages with no standard sem ver, in this case we increment the "unknown" severity
          return {
            ...acc,
            groupByType: increaseAmount(acc.groupByType, currentType, "unknown")
          };
        }
        return acc;
      }
    },
    { groupByType: initGroupByType, mostOutdated: [] }
  );

const maxNameWidthCol = 20;
const maxWidthCol = 10;

const tableCell = (text: string, maxWidth: number): string =>
  `${text}${" ".repeat(maxWidth - text.length)}`;

const tableRow = (name: string, severity: GroupBySeverity) =>
  anyOutdated(severity)
    ? tableCell(name, maxNameWidthCol) +
      tableCell(severity.major.toString(), maxWidthCol) +
      tableCell(severity.minor.toString(), maxWidthCol) +
      tableCell(severity.patch.toString(), maxWidthCol) +
      tableCell(severity.unknown.toString(), maxWidthCol) +
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

const getDeltaMajorVersion = (outdated: OutdatedPackage): number =>
  semver.major(outdated.latestVersion) - semver.major(outdated.currentVersion);

/**
 * Sort two {@OutdatedPackage} returning first the most outdated dependency
 * @param a
 * @param b
 */
const compareByDeltaMajorVersion = (
  a: OutdatedPackage,
  b: OutdatedPackage
): number => {
  const deltaA = getDeltaMajorVersion(a);
  const deltaB = getDeltaMajorVersion(b);
  return deltaB - deltaA;
};

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

const generateSlackMessage = (stats: OutdatedStats) => {
  const outdatedPackages = stats.groupByType;
  const header =
    " ".repeat(maxNameWidthCol) +
    tableCell("Major", maxWidthCol) +
    tableCell("Minor", maxWidthCol) +
    tableCell("Patch", maxWidthCol) +
    tableCell("Unknown", maxWidthCol) +
    "\n";

  const table =
    "```" +
    header +
    tableRow("Dependencies", outdatedPackages.dependencies) +
    tableRow("DevDependencies", outdatedPackages.devDependencies) +
    tableRow("ResDependencies", outdatedPackages.resolutionDependencies) +
    tableRow("Others", outdatedPackages.others) +
    tableRow("Total", getTotalSeverity(outdatedPackages)) +
    "```\n";

  const mostOutdatedLines = stats.mostOutdated
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

  return (
    outdatedEmoji[Math.floor(Math.random() * outdatedEmoji.length)] +
    " `yarn outdated` weekly report for :io-app: App:\n" +
    table +
    mostOutdatedSection
  );
};

/**
 * The main script workflow orchestrator:
 * - Execute yarn outdated --json and extract the JSON results
 * - Decode the JSON as {@link DependenciesTable}
 * - Convert {@link DependenciesTable} in {@link GroupByType} (aggregate stats by type, severity)
 *   TODO: - Save the result
 * - Convert {@link GroupByType} to a human readable slack message (string)
 * - Publish the report on slack channel #io_app_dev_feed
 */
const main = async () => {
  try {
    const rawJSON = await readOutdatedJson();
    const outdatedPackages = DependenciesTable.decode(rawJSON).map(
      extractGroupByType
    );

    // console.log(JSON.stringify(outdatedPackages));

    if (outdatedPackages.isRight()) {
      const boh = await slackPostMessage(
        generateSlackMessage(outdatedPackages.value),
        "#test"
      );
      console.log(boh);
    } else {
      console.log("Error while decoding the command output");
      console.log(readableReport(outdatedPackages.value));
    }
  } catch (e) {
    console.log("ERROR");
    console.log(e.message);
  }
};

void main().then().catch();
