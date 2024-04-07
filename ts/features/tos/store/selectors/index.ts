import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { TosConfig } from "../../../../../definitions/content/TosConfig";
import { privacyUrl } from "../../../../config";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";

const DEFAULT_TOS_CONFIG: TosConfig = {
  tos_url: privacyUrl,
  tos_version: 4.8
};

export const tosConfigSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    pipe(
      backendStatus,
      O.chainNullableK(bs => bs.config.tos),
      O.fold(
        () => DEFAULT_TOS_CONFIG,
        v => v
      )
    )
);
