import * as semver from "semver";
import { GroupByType } from "./GroupByType";

/**
 * Represent an outdated package with all the relevant information
 */
export type OutdatedPackage = {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: string;
  url: string;
};

/**
 * The stats representing all the outdated library
 * groupByType: all the outdated dependencies, grouped by type and by severity
 * mostOutdated: a list of the most outdated libraries
 */
export type OutdatedStats = {
  groupByType: GroupByType;
  mostOutdated: ReadonlyArray<OutdatedPackage>;
};

/**
 * Convert a raw row extracted from yarn outdated --json to {@link OutdatedPackage}
 * @param row
 */
export const toOutdatedPackage = (
  row: ReadonlyArray<string>
): OutdatedPackage => ({
  type: row[4],
  name: row[0],
  url: row[5],
  currentVersion: row[1],
  latestVersion: row[3]
});

/**
 * Return the distance between two OutdatedPackage major version
 * @param outdated
 */
export const getDeltaMajorVersion = (outdated: OutdatedPackage): number =>
  semver.major(outdated.latestVersion) - semver.major(outdated.currentVersion);

/**
 * Sort two {@OutdatedPackage} returning first the most outdated dependency
 * @param a
 * @param b
 */
export const compareByDeltaMajorVersion = (
  a: OutdatedPackage,
  b: OutdatedPackage
): number => {
  const deltaA = getDeltaMajorVersion(a);
  const deltaB = getDeltaMajorVersion(b);
  return deltaB - deltaA;
};
