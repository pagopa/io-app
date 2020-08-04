import { fromNullable } from "fp-ts/lib/Option";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver from "semver";
import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { NumberFromString } from "./number";
export const storeUrl = Platform.select({
  ios: "itms-apps://itunes.apple.com/it/app/io/id1501681835",
  android: "market://details?id=it.pagopa.io.app",
  default: "undefined"
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
  const semSatisfies = semver.satisfies(minVersion, `<=${currentAppVersion}`);
  const minAppVersionSplitted = minAppVersion.split(".");
  const currentAppVersionSplitted = appVersion.split(".");
  // since semantic version consider only major.minor.path
  // if both versions have fourth digit let's compare also these values
  if (
    minAppVersionSplitted.length === 4 &&
    currentAppVersionSplitted.length === 4
  ) {
    // if can't decode one of the two fourth digit, we assume true (can't say nothing)
    const forthDigitSatisfies = NumberFromString.decode(
      minAppVersionSplitted[3]
    )
      .map(a =>
        NumberFromString.decode(currentAppVersionSplitted[3])
          .map(b => a <= b)
          .getOrElse(true)
      )
      .getOrElse(true);
    return semSatisfies && forthDigitSatisfies;
  }
  return semSatisfies;
};

export const getAppVersion = () =>
  Platform.select({
    ios: DeviceInfo.getReadableVersion(),
    default: DeviceInfo.getVersion()
  });

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
        default: "undefined",
        ios: si[section].ios,
        android: si[section].android
      });
      return !isVersionAppSupported(minAppVersion, getAppVersion());
    })
    .getOrElse(false);
