import { fromNullable } from "fp-ts/lib/Option";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver from "semver";
import { ServerInfo } from "../../definitions/backend/ServerInfo";

/**
 * return true if appVersion >= minAppVersion
 * @param minAppVersion the min version supported
 * @param appVersion the version to be tested
 */
export const isVersionAppSupported = (
  minAppVersion: string,
  appVersion: string
): boolean => {
  const minVersion = semver.coerce(minAppVersion);
  const currentAppVersion = semver.coerce(appVersion);
  // cant compare
  if (!minVersion || !currentAppVersion) {
    return true;
  }
  return semver.satisfies(minVersion, `<=${currentAppVersion}`);
};

export const getAppVersion = () => {
  const version = DeviceInfo.getVersion();
  // if the version includes only major.minor (we manually ad the buildnumber as patch number)
  if (version.split(".").length === 2) {
    return `${version}.${DeviceInfo.getBuildNumber()}`;
  }
  return version;
};

/**
 * return true if the app must be updated
 * @param serverInfo the backend info
 */
export const isUpdatedNeeded = (serverInfo: ServerInfo) =>
  fromNullable(serverInfo)
    .map(si => {
      const minAppVersion = Platform.select({
        ios: si.min_app_version.ios,
        android: si.min_app_version.android
      });

      return !isVersionAppSupported(minAppVersion, getAppVersion());
    })
    .getOrElse(false);
