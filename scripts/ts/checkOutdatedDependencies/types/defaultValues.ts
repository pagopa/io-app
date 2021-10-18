import { GroupBySeverity } from "./GroupBySeverity";
import { GroupByType } from "./GroupByType";
import { OutdatedStats } from "./OutdatedStats";

export const initSeverityByType: GroupBySeverity = {
  major: 0,
  minor: 0,
  patch: 0,
  unknown: 0
};

export const initGroupByType: GroupByType = {
  dependencies: initSeverityByType,
  devDependencies: initSeverityByType,
  resolutionDependencies: initSeverityByType,
  others: initSeverityByType
};

export const initOutdatedStats: OutdatedStats = {
  groupByType: initGroupByType,
  mostOutdated: []
};
