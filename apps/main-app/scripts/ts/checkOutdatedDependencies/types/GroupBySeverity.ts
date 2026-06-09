const keyOfGroupBySeverity = ["major", "minor", "patch", "unknown"] as const;
type KeyOfGroupBySeverity = (typeof keyOfGroupBySeverity)[number];

/**
 * Group the outdated library, grouped by severity
 */
export type GroupBySeverity = {
  [k in KeyOfGroupBySeverity]: number;
};

/**
 * Return true if at least one of the severity type is !== 0
 * @param severity
 */
export const anyOutdated = (severity: GroupBySeverity) =>
  Object.keys(severity).some(x => severity[x as KeyOfGroupBySeverity] !== 0);

/**
 * Convert a string to {@link KeyOfGroupBySeverity},  in order to be used in a typesafe way
 * @param plain
 */
export const getSeverityType = (plain: string | null): KeyOfGroupBySeverity => {
  if (
    plain !== null &&
    keyOfGroupBySeverity.includes(plain as KeyOfGroupBySeverity)
  ) {
    return plain as KeyOfGroupBySeverity;
  } else {
    return "unknown";
  }
};
