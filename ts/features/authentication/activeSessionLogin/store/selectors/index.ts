import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { differenceInDays } from "date-fns";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { sessionInfoSelector } from "../../../common/store/selectors";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { apiLoginUrlPrefix } from "../../../../../config";

export const isActiveSessionLoginLocallyEnabledSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.activeSessionLogin.activeSessionLoginLocalFlag;

export const isActiveSessionLoginRemotelyEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chain(config => O.fromNullable(config.loginConfig?.activeSessionLogin)),
      isMinAppVersionSupported
    )
);

export const isActiveSessionLoginEnabledSelector = createSelector(
  isActiveSessionLoginRemotelyEnabledSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  (isRemotelyEnabled, isLocalFlagEnabled) =>
    isRemotelyEnabled || isLocalFlagEnabled
);

export const isActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.isActiveSessionLogin ?? false;

export const activeSessionUserLoggedSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.isUserLoggedIn;

export const idpSelectedActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.idp;

export const newTokenActiveSessionLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.token;

export const isActiveSessionFastLoginEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo?.fastLoginOptIn ??
  false;

export const cieIDSelectedSecurityLevelActiveSessionLoginSelector = (
  state: GlobalState
) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo
    ?.cieIDSelectedSecurityLevel;

export const activeSessionLoginInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo;

export const hasBlockingScreenBeenVisualizedSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.engagement
    .hasBlockingScreenBeenVisualized;

export const showSessionExpirationBannerSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.engagement
    .showSessionExpirationBanner;

export const isSessionExpiringSelector = createSelector(
  sessionInfoSelector,
  remoteConfigSelector,
  isFastLoginEnabledSelector,
  (sessionInfo, config, isFastLogin) =>
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
          threshold >= 0 &&
          differenceInDays(expirationDate, new Date()) <= threshold
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Determines whether to show the session expiration blocking screen.
 * The conditions are explicitly mapped for better readability and maintainability
 *
 * This selector controls the display of a full-screen modal that appears when:
 * 1. The user's session is about to expire AND the active session login feature
 *    is remotely enabled AND the blocking screen hasn't been shown yet
 * 2. OR when testing locally with the local flag enabled AND the blocking screen
 *    hasn't been shown yet
 *
 * The blocking screen is shown BEFORE the banner and serves as the primary
 * notification method. Once dismissed, it sets hasBlockingScreenBeenVisualized
 * to true, which then allows the banner to be shown instead.
 */
export const showSessionExpirationBlockingScreenSelector = createSelector(
  isSessionExpiringSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  isActiveSessionLoginRemotelyEnabledSelector,
  hasBlockingScreenBeenVisualizedSelector,
  (
    isSessionExpiring,
    isActiveSessionLoginLocallyEnabled,
    isActiveSessionLoginRemotelyEnabled,
    hasBlockingScreenBeenVisualized
  ) => {
    // production: show blocking screen when session is expiring,
    // feature is remotely enabled, and screen hasn't been shown yet
    if (
      isSessionExpiring &&
      isActiveSessionLoginRemotelyEnabled &&
      !hasBlockingScreenBeenVisualized
    ) {
      return true;
    }
    // testing: show blocking screen when local flag is enabled
    // and screen hasn't been shown yet (ignores session expiration for testing)
    if (
      isActiveSessionLoginLocallyEnabled &&
      !hasBlockingScreenBeenVisualized
    ) {
      return true;
    }
    return false;
  }
);

/**
 * Determines whether to show the session expiration banner.
 * The conditions are explicitly mapped for better readability and maintainability
 *
 * This selector controls the display of a banner that appears in different scenarios:
 * 1. Legacy mode: When active session login is NOT remotely enabled, but the session
 *    is expiring and the banner flag is true (maintains old behavior)
 * 2. Production mode: When the session is expiring, active session login is remotely
 *    enabled, the blocking screen has already been shown, and the banner flag is true
 * 3. Testing mode: When local testing is enabled, the blocking screen has been shown,
 *    and the banner flag is true (ignores session expiration for testing)
 *
 * The banner serves as a persistent reminder after the blocking screen has been dismissed,
 * or as the primary notification method in legacy mode when the new blocking screen
 * feature is disabled.
 *
 * the banner even when other conditions are met (useful for user dismissal).
 */
export const showSessionExpirationBannerRenderableSelector = createSelector(
  isSessionExpiringSelector,
  isActiveSessionLoginLocallyEnabledSelector,
  isActiveSessionLoginRemotelyEnabledSelector,
  hasBlockingScreenBeenVisualizedSelector,
  showSessionExpirationBannerSelector,
  (
    isSessionExpiring,
    isActiveSessionLoginLocallyEnabled,
    isActiveSessionLoginRemotelyEnabled,
    hasBlockingScreenBeenVisualized,
    showSessionExpirationBanner
  ) => {
    // Legacy mode: show banner when active session login is disabled remotely,
    // session is expiring, and banner hasn't been dismissed by user
    if (
      !isActiveSessionLoginRemotelyEnabled &&
      isSessionExpiring &&
      showSessionExpirationBanner
    ) {
      return true;
    }
    // Production mode: show banner after blocking screen has been shown,
    // when session is expiring, feature is enabled, and banner hasn't been dismissed
    if (
      isSessionExpiring &&
      isActiveSessionLoginRemotelyEnabled &&
      hasBlockingScreenBeenVisualized &&
      showSessionExpirationBanner
    ) {
      return true;
    }
    // Testing mode: show banner after blocking screen has been shown,
    // when local flag is enabled and banner hasn't been dismissed
    // (ignores session expiration for testing purposes)
    if (
      isActiveSessionLoginLocallyEnabled &&
      hasBlockingScreenBeenVisualized &&
      showSessionExpirationBanner
    ) {
      return true;
    }
    return false;
  }
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
export const shouldRefreshMessagesSectionSelector = (state: GlobalState) =>
  state?.features?.loginFeatures?.activeSessionLogin?.refreshMessagesSection ??
  true;
