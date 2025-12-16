import { Platform } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { Config } from "../../../definitions/content/Config";
import { VersionPerPlatform } from "../../../definitions/content/VersionPerPlatform";
import { getAppVersion, isVersionSupported } from "../../utils/appVersion";

type ObjectWithMinAppVersion =
  | { min_app_version?: VersionPerPlatform }
  | undefined;

// This type extracts all keys that have a structure with min_app_version
type KeysWithMinAppVersion<T> = Extract<
  keyof T,
  {
    [K in keyof T]: T[K] extends ObjectWithMinAppVersion ? K : never;
  }[keyof T]
>;

// This type extracts all keys that have a structure with min_app_version, nested in another type
type ExtractSecondLevelKeyWithMinAppVersion<
  T,
  FirstLevel extends keyof T
> = T[FirstLevel] extends infer U
  ? U extends object
    ? KeysWithMinAppVersion<U>
    : never
  : never;

// This type defines the parameters for a function so that the name of the parameter must
// be specified and that any optional configuration of a FF is present in whole, not in part
type CheckPropertyWithMinAppVersionParameters<
  T extends KeysWithMinAppVersion<Config>
> = {
  remoteConfig: O.Option<Config>;
  mainLocalFlag: boolean;
  configPropertyName: T;
} & (
  | { optionalConfig?: undefined; optionalLocalFlag?: undefined }
  | {
      optionalLocalFlag: boolean;
      optionalConfig: ExtractSecondLevelKeyWithMinAppVersion<Config, T>;
    }
);

/**
* This function checks that a feature flag is enabled by checking the local option and the minimum
* version of the feature set remotely.
* It is possible to specify an optional configuration that corresponds to a feature flag nested into the main one.
* If the main FF is deactivated, any nested FF will also be considered deactivated.
*
* Details:
* The fuction take an object with this property:
* @property {Option\<Config\>} remoteConfig - Our remoteConfig object
* @property {boolean} mainLocalFlag - The local config that represents the feature
* @property {KeysWithMinAppVersion\<Config\>} configPropertyName - A property that extends ObjectWithMinAppVersion in the Config object (from backendStatus)
*
* @example
* isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: fastLoginConfig,
        configPropertyName: "fastLogin"
      });
* @returns {boolean} Returns the fastLogin feature flag state.
*
*  If you want the feature flag state of an inner configuration, you can specify two more properties
* @property {boolean} optionalLocalFlag - The local config that represents the nested feature
* @property {ExtractSecondLevelKeyWithMinAppVersion\<Config, KeysWithMinAppVersion\<Config\>\>} optionalLocalFlag - A property nested in Config (from backendStatus) that extends ObjectWithMinAppVersion
*
* @example
* isPropertyWithMinAppVersionEnabled({
        remoteConfig: store,
        mainLocalFlag: fastLoginConfig,
        configPropertyName: "fastLogin",
        optionalLocalFlag: optInFastLoginConfig,
        optionalConfig: "opt_in"
      });
* @returns {boolean} Returns the opt_in feature flag state.
*/
export const isPropertyWithMinAppVersionEnabled = <
  T extends KeysWithMinAppVersion<Config>
>({
  remoteConfig,
  mainLocalFlag,
  configPropertyName,
  optionalLocalFlag,
  optionalConfig
}: CheckPropertyWithMinAppVersionParameters<T>): boolean =>
  pipe(
    mainLocalFlag &&
      pipe(
        O.fromNullable(
          getObjectWithMinAppVersion(
            remoteConfig,
            mainLocalFlag,
            configPropertyName,
            optionalLocalFlag,
            optionalConfig
          )
        ),
        isMinAppVersionSupported
      )
  );

function getObjectWithMinAppVersion<T extends KeysWithMinAppVersion<Config>>(
  remoteConfig: O.Option<BackendStatus["config"]>,
  mainLocalFlag: boolean,
  configPropertyName: T,
  optionalLocalFlag?: boolean,
  optionalConfig?: ExtractSecondLevelKeyWithMinAppVersion<Config, T>
): ObjectWithMinAppVersion {
  return pipe(
    remoteConfig,
    O.chainNullableK(cfg => cfg[configPropertyName]),
    O.fold(
      () => undefined,
      firstLevel =>
        pipe(
          O.fromNullable(optionalConfig),
          O.fold(
            () => firstLevel,
            opt =>
              optionalLocalFlag &&
              isPropertyWithMinAppVersionEnabled({
                remoteConfig,
                mainLocalFlag,
                configPropertyName
              })
                ? firstLevel[opt]
                : undefined
          )
        )
    )
  );
}

type RemoteConfigMinAppVersion = O.Option<ObjectWithMinAppVersion>;

export const isMinAppVersionSupported = (
  minAppVersionOption: RemoteConfigMinAppVersion
): boolean =>
  pipe(
    minAppVersionOption,
    O.chainNullableK(config => config?.min_app_version),
    O.map(mav => (Platform.OS === "ios" ? mav.ios : mav.android)),
    O.chain(semVer =>
      pipe(
        semVer,
        PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode,
        E.fold(
          _ => O.none,
          v => O.some(v)
        )
      )
    ),
    O.fold(
      () => false,
      v => isVersionSupported(v, getAppVersion())
    )
  );
