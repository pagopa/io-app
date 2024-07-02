import { computedProp } from "../../../../ts/types/utils";
import { initSeverityByType } from "./defaultValues";
import { GroupBySeverity } from "./GroupBySeverity";

const keyOfGroupByType = [
  "devDependencies",
  "dependencies",
  "resolutionDependencies",
  "others"
] as const;
type KeyGroupByType = (typeof keyOfGroupByType)[number];

/**
 * Represents the grouping of outdated dependencies by type
 */
export type GroupByType = {
  [k in KeyGroupByType]: GroupBySeverity;
};

/**
 * Iterate through groupByType and generate a total count {@link GroupBySeverity} foreach type
 * @param groupByType
 */
export const getTotalSeverity = (groupByType: GroupByType): GroupBySeverity =>
  Object.keys(groupByType).reduce(
    (acc, val) => ({
      major: groupByType[val as KeyGroupByType].major + acc.major,
      minor: groupByType[val as KeyGroupByType].minor + acc.minor,
      patch: groupByType[val as KeyGroupByType].patch + acc.patch,
      unknown: groupByType[val as KeyGroupByType].unknown + acc.unknown
    }),
    initSeverityByType
  );

/**
 * Convert a string to {@link KeyGroupByType}, in order to be used in a typesafe way
 * @param plain
 */
export const getDependencyType = (plain: string): KeyGroupByType => {
  if (keyOfGroupByType.includes(plain as KeyGroupByType)) {
    return plain as KeyGroupByType;
  } else {
    return "others";
  }
};

/**
 * Increase the severity amount by 1 for value, using type and severity as keys
 * @param value
 * @param type
 * @param severity
 */
export const increaseSeverityAmount = (
  value: GroupByType,
  type: keyof GroupByType,
  severity: keyof GroupBySeverity
): GroupByType => ({
  ...value,
  ...computedProp(type, {
    ...value[type],
    ...computedProp(severity, value[type][severity] + 1)
  })
});
