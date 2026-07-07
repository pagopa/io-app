import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";
import { remoteConfigSelector } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { isPropertyWithMinAppVersionEnabled } from "../../../../../../store/reducers/featureFlagWithMinAppVersionStatus";

const cdcRemoteConfigSelector = (state: GlobalState) => {
  const remoteConfig = state.remoteConfig;
  if ("value" in remoteConfig) {
    return remoteConfig.value.cdcV2;
  }

  return undefined;
};

/**
 * Return the remote config about CDC CTA inside the onboarding screen.
 */
export const cdcCtaConfigSelector = createSelector(
  cdcRemoteConfigSelector,
  cdcConfig => cdcConfig?.cta_onboarding_config
);

/**
 * Return true if the CdC wallet visibility feature is enabled by remote config and the app version is supported
 */
export const isCdCWalletVisibilityEnabledSelector = (state: GlobalState) =>
  isPropertyWithMinAppVersionEnabled({
    remoteConfig: remoteConfigSelector(state),
    mainLocalFlag: true,
    configPropertyName: "cdcV2",
    optionalLocalFlag: true,
    optionalConfig: "walletVisibility"
  });

/**
 * Return the remote config about CDC wallet visibility.
 */
export const cdcWalletVisibilityConfigSelector = createSelector(
  cdcRemoteConfigSelector,
  cdcConfig => cdcConfig?.walletVisibility?.configurations
);
