/* eslint-disable no-console */
import { exec } from "child_process";
import * as util from "util";
import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as semver from "semver";
import { pipe } from "fp-ts/lib/function";
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
 * Execute the command "yarn outdated --json" and return the results as string
 */
const readOutdatedJson = async (): Promise<string> => {
  try {
    const std = await execAsync("yarn outdated --json");
    return std.stdout;
  } catch (e) {
    const code = (e as any).code;
    const stdout = (e as any).stdout;
    const message = (e as any).message;

    // When the command finds outdated packages, return with exit code 1
    if (code === 1) {
      return stdout;
    } else {
      throw new Error(
        `Error ${code} while executing 'yarn outdated --json': ${message}`
      );
    }
  }
};

/**
 * Try to extract the second section of the stdout. The first section describe the table header, the second section the content.
 * @param stdout
 */
const extractStdoutSection = (
  stdout: string
): E.Either<Error | Errors, any> => {
  const splittedErrorStdout = stdout.split("\n");
  if (splittedErrorStdout.length > 1) {
    return E.right(JSON.parse(splittedErrorStdout[1]));
  }
  return E.left(new Error("stdout splitting has the wrong size"));
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
      const name = (e as any).name;

      if (name === "TypeError") {
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
 * - Convert {@link OutdatedStats} to a human readable slack message, split in chunk (string)
 * - Publish the report on slack channel #io_app_dev_feed
 */
const main = async () => {
  try {
    console.log("Executing yarn outdated --json");
    const rawJSON = await readOutdatedJson();
    console.log("Convert the json to OutdatedStats");

    const outdatedPackages = pipe(
      extractStdoutSection(rawJSON),
      E.chainW(DependenciesTable.decode),
      E.map(extractGroupByType)
    );

    if (E.isRight(outdatedPackages)) {
      console.log(`Send slack message to ${destinationChannel}`);
      await Promise.all(
        generateSlackMessage(outdatedPackages.right).map(line =>
          slackPostMessage(line, destinationChannel, false)
        )
      );
    } else {
      console.log("Error while decoding the command output:");
      const report =
        outdatedPackages.left instanceof Error
          ? outdatedPackages.left.message
          : readableReport(outdatedPackages.left);
      console.log(report);
    }
  } catch (e) {
    console.log("Generic error while executing the script:");
    // We don't use convertUnknownToError because this script is executed in isolated mode and doesn't have access to the app codebase
    const error = e as Error;
    console.log(error.message);
  }
};

void main().then().catch();
