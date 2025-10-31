import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { differenceInDays } from "date-fns";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { sessionInfoSelector } from "../../../common/store/selectors";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { showSessionExpirationBannerSelector } from "../../../loginPreferences/store/selectors";

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

export const activeSessionLoginInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin?.loginInfo;

export const hasBlockingScreenBeenVisualizedSelector = (state: GlobalState) =>
  state.features.loginFeatures.activeSessionLogin.engagement
    .hasBlockingScreenBeenVisualized;

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
    // production
    if (
      isSessionExpiring &&
      isActiveSessionLoginRemotelyEnabled &&
      !hasBlockingScreenBeenVisualized
    ) {
      return true;
    }
    // testing
    if (
      isActiveSessionLoginLocallyEnabled &&
      !hasBlockingScreenBeenVisualized
    ) {
      return true;
    }
    return false;
  }
);

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
    // as-is
    if (
      !isActiveSessionLoginRemotelyEnabled &&
      isSessionExpiring &&
      showSessionExpirationBanner
    ) {
      return true;
    }
    // production
    if (
      isSessionExpiring &&
      isActiveSessionLoginRemotelyEnabled &&
      hasBlockingScreenBeenVisualized &&
      showSessionExpirationBanner
    ) {
      return true;
    }
    // testing
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
