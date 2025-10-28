import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { differenceInDays } from "date-fns";
import { GlobalState } from "../../../../../store/reducers/types";
import { sessionInfoSelector } from "../../../common/store/selectors";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { apiLoginUrlPrefix } from "../../../../../config";
import {
  isActiveSessionLoginEnabledSelector,
  isActiveSessionLoginLocallyEnabledSelector
} from "../../../activeSessionLogin/store/selectors";

/**
 * This selector returns a boolean that indicates whether to show
 * the sessionExpirationBanner or not
 */
const isVisibleSessionExpirationBannerSelector = (state: GlobalState) =>
  state.features.loginFeatures.loginPreferences.showSessionExpirationBanner;

const showSessionExpirationBannerSelector = createSelector(
  isVisibleSessionExpirationBannerSelector,
  isActiveSessionLoginEnabledSelector,
  (isVisible, isActiveSessionLoginEnabled) =>
    isVisible || isActiveSessionLoginEnabled
);

/**
 * This selector combines control over the value of `expirationDate`,
 * ensuring that the difference with the actual date at the time of the check
 * is less than a specified value in days (e.g., 30),
 * with the value related to the `showSessionExpirationBanner` data.
 */
export const isSessionExpirationBannerRenderableSelector = createSelector(
  sessionInfoSelector,
  remoteConfigSelector,
  showSessionExpirationBannerSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  isFastLoginEnabledSelector,
  (
    sessionInfo,
    config,
    showSessionExpirationBanner,
    isActiveSessionLoginLocallyEnabled,
    isFastLogin
  ) =>
    pipe(
      O.Do,
      O.bind("expirationDate", () =>
        pipe(
          sessionInfo,
          O.chainNullableK(({ expirationDate }) => expirationDate)
        )
      ),
      O.bind("threshold", () =>
        pipe(
          config,
          O.chainNullableK(({ loginConfig }) =>
            isFastLogin
              ? loginConfig?.notifyExpirationThreshold?.fastLogin
              : loginConfig?.notifyExpirationThreshold?.standardLogin
          )
        )
      ),
      O.map(
        ({ expirationDate, threshold }) =>
          (threshold >= 0 &&
            showSessionExpirationBanner &&
            differenceInDays(expirationDate, new Date()) <= threshold) ||
          isActiveSessionLoginLocallyEnabled
      ),
      O.getOrElse(() => false)
    )
);

/**
 * This selector returns the remote API login URL prefix.
 * If the remote config does not provide a login URL,
 * it falls back to the default API login URL prefix.
 */
export const remoteApiLoginUrlPrefixSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chain(config => O.fromNullable(config.loginConfig?.loginUrl)),
      O.getOrElse(() => apiLoginUrlPrefix)
    )
);
