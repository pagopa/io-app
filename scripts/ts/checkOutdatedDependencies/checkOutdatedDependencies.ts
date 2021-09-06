/* eslint-disable no-console */
import { exec } from "child_process";

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

const main = () => {
  exec("yarn outdated --json", (error, stdout, _) => {
    if (error?.code !== undefined && error.code !== 1) {
      console.log(
        `Error ${error.code} while executing 'yarn outdated --json': ${error.message} `
      );
      return;
    }

    const outdatedJson = JSON.parse(stdout.split("\n")[1]);
    const outdatedPackages = DependenciesTable.decode(outdatedJson);

    if (outdatedPackages.isRight()) {
      console.log(outdatedPackages.value.data.body.length);
      const aggregate = outdatedPackages.value.data.body.reduce<GroupByType>(
        (acc, val) => {
          const currentType = getDependencyType(val[4]);
          try {
            const currentSeverity = getSeverityType(
              semver.diff(val[1], val[3])
            );
            return increaseAmount(acc, currentType, currentSeverity);
          } catch (e) {
            if (e.name === "TypeError") {
              // We use some packages with no standard sem ver, in this case we increment the "unknown" severity
              return increaseAmount(acc, currentType, "unknown");
            }
            return acc;
          }
        },
        initGroupByType
      );
      console.log(aggregate);
    } else {
      console.log("Error while decoding the command output");
      console.log(readableReport(outdatedPackages.value));
    }
  });
};

main();
