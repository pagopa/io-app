import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { TosConfig } from "../../../../../definitions/content/TosConfig";
// eslint-disable-next-line no-restricted-imports
import { privacyUrl } from "../../../../config";
import { remoteConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

const DEFAULT_TOS_CONFIG: TosConfig = {
  tos_url: privacyUrl,
  tos_version: 4.91
};

export const tosConfigSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chainNullableK(config => config.tos),
      O.fold(
        () => DEFAULT_TOS_CONFIG,
        v => v
      )
    )
);
