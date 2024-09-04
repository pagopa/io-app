import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { backendStatusSelector } from "../../../../store/reducers/backendStatus";
import { isPropertyWithMinAppVersionEnabled } from "../../../../store/reducers/featureFlagWithMinAppVersionStatus";

export const isCieLoginUatEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.useUat;

const isCieIdMinAppVersionEnabledSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    isPropertyWithMinAppVersionEnabled({
      backendStatus,
      mainLocalFlag: true,
      configPropertyName: "cie_id"
    })
);

export const isCieIDLocalFeatureEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.isCieIDFeatureEnabled;

export const isCieIDFFEnabledSelector = createSelector(
  isCieIDLocalFeatureEnabledSelector,
  isCieIdMinAppVersionEnabledSelector,
  (localFlag, remoteFlag) => localFlag || remoteFlag
);
