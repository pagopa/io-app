/* eslint-disable no-console */
import { exec } from "child_process";
import * as util from "util";
import { readableReport } from "italia-ts-commons/lib/reporters";
import * as semver from "semver";
import { slackPostMessage } from "../common/slack/postMessage";
import { generateSlackMessage } from "./generateSlackMessage";
import { initOutdatedStats } from "./types/defaultValues";
import { DependenciesTable } from "./types/DependeciesTable";
import { getSeverityType } from "./types/GroupBySeverity";
import { getDependencyType, increaseSeverityAmount } from "./types/GroupByType";
import { OutdatedStats, toOutdatedPackage } from "./types/OutdatedStats";

const execAsync = util.promisify(exec);

const majorVersionDeltaWarning = 3;

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
 * Transform the raw structure {@link DependenciesTable} representing the JSON to {@link OutdatedStats} aggregated stats
 * @param deps
 */
const extractGroupByType = (deps: DependenciesTable): OutdatedStats =>
  deps.data.body.reduce<OutdatedStats>((acc, val) => {
    const currentType = getDependencyType(val[4]);
    try {
      const currentSeverity = getSeverityType(semver.diff(val[1], val[3]));
      const currentMajor = semver.major(val[1]);
      const latestMajor = semver.major(val[3]);
      return {
        groupByType: increaseSeverityAmount(
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
          groupByType: increaseSeverityAmount(
            acc.groupByType,
            currentType,
            "unknown"
          )
        };
      }
      return acc;
    }
  }, initOutdatedStats);

const destinationChannel = "#io_dev_app_feed";

/**
 * The main script workflow orchestrator:
 * - Execute yarn outdated --json and extract the JSON results
 * - Decode the JSON as {@link DependenciesTable}
 * - Convert {@link DependenciesTable} in {@link OutdatedStats} (aggregate stats by type, severity)
 *   TODO: - Save the result
 * - Convert {@link OutdatedStats} to a human readable slack message (string)
 * - Publish the report on slack channel #io_app_dev_feed
 */
const main = async () => {
  try {
    console.log("Executing yarn outdated --json");
    const rawJSON = await readOutdatedJson();
    console.log("Convert the json to OutdatedStats");
    const outdatedPackages = DependenciesTable.decode(rawJSON).map(
      extractGroupByType
    );

    if (outdatedPackages.isRight()) {
      console.log(`Send slack message to ${destinationChannel}`);
      await slackPostMessage(
        generateSlackMessage(outdatedPackages.value),
        destinationChannel,
        false
      );
    } else {
      console.log("Error while decoding the command output:");
      console.log(readableReport(outdatedPackages.value));
    }
  } catch (e) {
    console.log("Generic error while executing the script:");
    console.log(e.message);
  }
};

void main().then().catch();
