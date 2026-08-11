import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { compare } from "compare-versions";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { BackendStatus } from "../../../generated/definitions/content/BackendStatus";
import { VersionPerPlatform } from "../../../generated/definitions/content/VersionPerPlatform";
import { backendStatus } from "../../payloads/backend";
import { getAppOs, getAppVersion } from "../../persistence/appInfo";

type FeatureFlagWithMinAppVersion<T> = Extract<
  keyof T,
  {
    [K in keyof T]: T[K] extends
      | undefined
      | { min_app_version?: VersionPerPlatform }
      ? K
      : never;
  }[keyof T]
>;

export const isVersionValidAndActive = (version: string | undefined) =>
  pipe(
    version,
    PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode,
    E.fold(
      _ => false,
      minAppVersion =>
        pipe(
          getAppVersion(),
          PatternString(`^(?!0(.0)*$)\\d+(\\.\\d+)*$`).decode,
          E.fold(
            _ => false,
            userAppVersion => compare(minAppVersion, userAppVersion, "<=")
          )
        )
    )
  );

export const isFeatureFlagWithMinVersionEnabled = (
  featureFlag: FeatureFlagWithMinAppVersion<BackendStatus["config"]>
) =>
  pipe(
    O.fromNullable(backendStatus.config[featureFlag]?.min_app_version),
    O.fold(
      () => false,
      (min_app_version: VersionPerPlatform) =>
        pipe(
          getAppOs(),
          O.fold(
            () => false,
            os => isVersionValidAndActive(min_app_version[os])
          )
        )
    )
  );
