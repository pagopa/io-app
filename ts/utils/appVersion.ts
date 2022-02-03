import { Either, fromNullable } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { PatternString } from "italia-ts-commons/lib/strings";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver, { SemVer } from "semver";
import { ioWebSiteUrl } from "./global";
import { NumberFromString } from "./number";

export const storeUrl = Platform.select({
  ios: "itms-apps://itunes.apple.com/it/app/io/id1501681835",
  android: "market://details?id=it.pagopa.io.app",
  default: ioWebSiteUrl
});
export const webStoreURL = Platform.select({
  ios: "https://apps.apple.com/it/app/io/id1501681835",
  android: "https://play.google.com/store/apps/details?id=it.pagopa.io.app",
  default: ioWebSiteUrl
});

const VersionFormat = PatternString("^\\d+(.\\d+){0,3}$");

const validateFormat = (value: string): Either<Errors, SemVer> =>
  VersionFormat.decode(value).chain(v => fromNullable([])(semver.coerce(v)));

/**
 * return true if appVersion >= minAppVersion
 * @param minAppVersion the min version supported
 * @param appVersion the version to be tested
 */
export const isVersionSupported = (
  minAppVersion: string,
  appVersion: string
): boolean => {
  const minVersion = validateFormat(minAppVersion);
  const currentAppVersion = validateFormat(appVersion);

  // If the validation of one of the two version fails, we cannot say anything ad we continue to support the version
  if (minVersion.isLeft() || currentAppVersion.isLeft()) {
    return true;
  }

  const semSatisfies = semver.satisfies(
    minVersion.value,
    `<=${currentAppVersion.value}`
  );
  const minAppVersionSplitted = minAppVersion.split(".");
  const currentAppVersionSplitted = appVersion.split(".");
  // since semantic version consider only major.minor.path
  // if both versions have fourth digit let's compare also these values
  if (
    minAppVersionSplitted.length === 4 &&
    currentAppVersionSplitted.length === 4
  ) {
    // if can't decode one of the two fourth digit, we assume true (can't say anything)
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
