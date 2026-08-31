import { GlobalState } from "../../../../../store/reducers/types";
import { getDeviceId } from "../../../../../utils/device";
import { isFeatureEnabled } from "../../../../../utils/featureRollout";
import { oneIdentityRolloutPercentageSelector } from "./remoteConfig";

export const oneIdentityEnvSelector = (state: GlobalState) =>
  state.features.loginFeatures.loginConfig.oneIdentityEnv;

/**
 * Retrieves the local feature flag for the OneIdentity login flow.
 * - `true` / `false`: Forces the feature on or off locally.
 * - `undefined`: Indicates no local setting, deferring to the remote rollout.
 */
export const oneIdentityLocalFeatureFlagSelector = (state: GlobalState) =>
  state.features.loginFeatures.loginConfig.oneIdentityLocalFeatureFlag;

/**
 * Determines whether the OneIdentity login flow should be used.
 *
 * Evaluates the local flag (`true` or `false`) first. If undefined,
 * it falls back to the deterministic remote rollout percentage for this device.
 */
export const isOneIdentityLoginEnabledSelector = (state: GlobalState) => {
  const localFeatureFlag = oneIdentityLocalFeatureFlagSelector(state);
  const rolloutPercentage = oneIdentityRolloutPercentageSelector(state);
  return (
    localFeatureFlag ??
    isFeatureEnabled(getDeviceId(), rolloutPercentage, "OneIdentityRollout")
  );
};
