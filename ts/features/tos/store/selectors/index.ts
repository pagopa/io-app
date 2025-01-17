import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { TosConfig } from "../../../../../definitions/content/TosConfig";
import {
  absolutePortalLinksSelector,
  remoteConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { PRIVACY_URL_BODY } from "../../../../urls";

export const tosConfigSelector = createSelector(
  remoteConfigSelector,
  absolutePortalLinksSelector,
  (remoteConfig, absolutePortalLinks) => {
    const DEFAULT_TOS_CONFIG: TosConfig = {
      tos_url: `${absolutePortalLinks.io_showcase}${PRIVACY_URL_BODY}`,
      tos_version: 5.0
    };
    return pipe(
      remoteConfig,
      O.chainNullableK(config => config.tos),
      O.fold(
        () => DEFAULT_TOS_CONFIG,
        v => v
      )
    );
  }
);
