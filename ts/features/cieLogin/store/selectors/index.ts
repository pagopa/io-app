import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { remoteConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPropertyWithMinAppVersionEnabled } from "../../../../store/reducers/featureFlagWithMinAppVersionStatus";

export const isCieLoginUatEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.useUat;

const isCieIdMinAppVersionEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: true,
      configPropertyName: "cie_id"
    })
);

export const isCieIDLocalFeatureEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.isCieIDFeatureEnabled;

export const isCieIDFFEnabledSelector = (state: GlobalState) =>
  isCieIDLocalFeatureEnabledSelector(state) ||
  isCieIdMinAppVersionEnabledSelector(state);
