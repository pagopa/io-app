import { fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver from "semver";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
export const storeUrl = Platform.select({
  ios: "itms-apps://itunes.apple.com/it/app/io/id1501681835",
  android: "market://details?id=it.pagopa.io.app"
});

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
  const semSatifies = semver.satisfies(minVersion, `<=${currentAppVersion}`);
  const minAppVersionSplitted = minAppVersion.split(".");
  const currentAppVersionSplitted = appVersion.split(".");
  // since semantic version consider only major.minor.path
  // if both versions have fourth digit let's compare also these value
  if (
    minAppVersionSplitted.length === 4 &&
    currentAppVersionSplitted.length === 4
  ) {
    const fourthMinAppDigit = t.number
      .decode(parseInt(minAppVersionSplitted[3], 10))
      .getOrElse(0);
    const fourthCurrentAppDigit = t.number
      .decode(parseInt(currentAppVersionSplitted[3], 10))
      .getOrElse(0);
    return semSatifies && fourthMinAppDigit <= fourthCurrentAppDigit;
  }
  return semSatifies;
};

export const getAppVersion = () => DeviceInfo.getReadableVersion();

/**
 * return true if the app must be updated
 * @param serverInfo the backend info
 */
export const isUpdateNeeded = (
  serverInfo: ServerInfo | undefined,
  section: "min_app_version_pagopa" | "min_app_version"
) =>
  fromNullable(serverInfo)
    .map(si => {
      const minAppVersion = Platform.select({
        ios: si[section].ios,
        android: si[section].android
      });
      return !isVersionAppSupported(minAppVersion, getAppVersion());
    })
    .getOrElse(false);
