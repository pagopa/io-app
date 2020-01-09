//import semver from "semver";
// Check min version app supported
export const isVersionAppSupported = (
  minAppVersion: string | undefined,
  DeviceVersion: string
): boolean => {
  if (minAppVersion && DeviceVersion) {
    return true;
  }
  return false;
  /*
  // If the backend-info is not available (es. request http error) continue to use app
  if (minAppVersion !== undefined) {
    const minVersion =
      semver.valid(minAppVersion) === null
        ? semver.coerce(minAppVersion)
        : minAppVersion;
    return minVersion !== null
      ? semver.satisfies(minVersion, `<=${DeviceVersion}`)
      : true;
  } else {
    return true;
  }
  */
};
