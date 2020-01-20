import { fromNullable } from "fp-ts/lib/Option";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver from "semver";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
// Check min version app supported
export const isVersionAppSupported = (
  minAppVersion: string | undefined,
  deviceVersion: string
): boolean => {
  // If the backend-info is not available (es. request http error) continue to use app
  if (minAppVersion !== undefined) {
    const minVersion =
      semver.valid(minAppVersion) === null
        ? semver.coerce(minAppVersion)
        : minAppVersion;
    return minVersion !== null
      ? semver.satisfies(minVersion, `<=${deviceVersion}`)
      : true;
  } else {
    return true;
  }
};

// The version for ios devices is composed from version app + version build
export const appVersion = Platform.select({
  ios: `${DeviceInfo.getVersion()}.${DeviceInfo.getBuildNumber()}`,
  android: DeviceInfo.getVersion()
});

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
      return !isVersionAppSupported(minAppVersion, appVersion);
    })
    .getOrElse(false);
