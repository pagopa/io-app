/* eslint-disable no-console */
import { exec } from "child_process";
import * as util from "util";
const execAsync = util.promisify(exec);

import { readableReport } from "italia-ts-commons/lib/reporters";
import * as semver from "semver";
import {
  DependenciesTable,
  getDependencyType,
  getSeverityType,
  GroupBySeverity,
  GroupByType
} from "./types";

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

/**
 * Transform the raw structure {@link DependenciesTable} representing the JSON structure to {@link GroupByType} aggregated stats
 * @param deps
 */
const extractGroupByType = (deps: DependenciesTable): GroupByType =>
  deps.data.body.reduce<GroupByType>((acc, val) => {
    const currentType = getDependencyType(val[4]);
    try {
      const currentSeverity = getSeverityType(semver.diff(val[1], val[3]));
      return increaseAmount(acc, currentType, currentSeverity);
    } catch (e) {
      if (e.name === "TypeError") {
        // We use some packages with no standard sem ver, in this case we increment the "unknown" severity
        return increaseAmount(acc, currentType, "unknown");
      }
      return acc;
    }
  }, initGroupByType);

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

    if (outdatedPackages.isRight()) {
      console.log(outdatedPackages.value);
    } else {
      console.log("Error while decoding the command output");
      console.log(readableReport(outdatedPackages.value));
    }
  } catch (e) {
    console.log(e.message);
  }
};

void main().then().catch();
