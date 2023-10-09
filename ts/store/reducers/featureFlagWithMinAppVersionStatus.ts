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

type KeysWithMinAppVersion<T> = Extract<
  keyof T,
  {
    [K in keyof T]: T[K] extends ObjectWithMinAppVersion ? K : never;
  }[keyof T]
>;

type ExtractSecondLevelKeyWithMinAppVersion<
  T,
  FirstLevel extends keyof T
> = T[FirstLevel] extends infer U
  ? U extends object
    ? KeysWithMinAppVersion<U>
    : never
  : never;

type CheckPropertyWithMinAppVersionParameters<
  T extends KeysWithMinAppVersion<Config>
> = {
  backendStatus: O.Option<BackendStatus>;
  mainLocalFlag: boolean;
  configPropertyName: T;
} & (
  | { optionalConfig?: undefined; optionalLocalFlag?: undefined }
  | {
      optionalLocalFlag: boolean;
      optionalConfig: ExtractSecondLevelKeyWithMinAppVersion<Config, T>;
    }
);

export const isPropertyWithMinAppVersionEnabled = <
  T extends KeysWithMinAppVersion<Config>
>({
  backendStatus,
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
            backendStatus,
            mainLocalFlag,
            configPropertyName,
            optionalLocalFlag,
            optionalConfig
          )
        ),
        O.chainNullableK(lp => lp.min_app_version),
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
      )
  );

function getObjectWithMinAppVersion<T extends KeysWithMinAppVersion<Config>>(
  backendStatus: O.Option<BackendStatus>,
  mainLocalFlag: boolean,
  configPropertyName: T,
  optionalLocalFlag?: boolean,
  optionalConfig?: ExtractSecondLevelKeyWithMinAppVersion<Config, T>
): ObjectWithMinAppVersion {
  return pipe(
    backendStatus,
    O.chainNullableK(bs => bs.config),
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
                backendStatus,
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
