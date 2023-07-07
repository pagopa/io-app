import * as E from "fp-ts/lib/Either";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import semver, { SemVer } from "semver";
import { pipe } from "fp-ts/lib/function";
import { itWalletEnabled } from "../config";
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

const validateFormat = (value: string): E.Either<Error, SemVer> =>
  pipe(
    value,
    VersionFormat.decode,
    E.mapLeft(E.toError),
    E.chain(v =>
      E.fromNullable(new Error(`Cannot parse ${value} using semver.coerce`))(
        semver.coerce(v)
      )
    )
  );

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

  if (itWalletEnabled) {
    return true;
  }

  // If the validation of one of the two versions fails, we cannot say anything ad we continue to support the version
  if (
    E.isLeft(minVersion) ||
    E.isLeft(currentAppVersion) ||
    // If satisfies the semver check, the app is supported
    semver.satisfies(minVersion.right, `<${currentAppVersion.right}`)
  ) {
    return true;
  }

  const semSatisfies = semver.satisfies(
    minVersion.right,
    `=${currentAppVersion.right}`
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
    const forthDigitSatisfies = pipe(
      minAppVersionSplitted[3],
      NumberFromString.decode,
      E.map(a =>
        pipe(
          currentAppVersionSplitted[3],
          NumberFromString.decode,
          E.map(b => a <= b),
          E.getOrElse(() => true)
        )
      ),
      E.getOrElse(() => true)
    );
    return semSatisfies && forthDigitSatisfies;
  }
  return semSatisfies;
};

export const getAppVersion = () =>
  Platform.select({
    ios: DeviceInfo.getReadableVersion(),
    default: DeviceInfo.getVersion()
  });
