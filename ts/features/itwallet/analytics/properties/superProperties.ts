import {
  isMixpanelInstanceInitialized,
  registerSuperProperties
} from "../../../../mixpanel";
import { GlobalState } from "../../../../store/reducers/types";
import { OfflineAccessReasonEnum } from "../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { buildItwBaseProperties } from "./basePropertyBuilder";
import { ITWBaseProperties } from "./propertyTypes";

export type ITWSuperProperties = ITWBaseProperties & {
  OFFLINE_ACCESS_REASON: string;
};

/**
 * Updates only ITW Profile properties.
 */
export const updateItwSuperProperties = (state: GlobalState) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  const baseProps = buildItwBaseProperties(state);
  const superProps = buildItwSuperProperties(state);

  registerSuperProperties({
    ...baseProps,
    ...superProps
  });
};

export const forceUpdateItwSuperProperties = (
  partialProps: Partial<ITWSuperProperties>
) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  registerSuperProperties(partialProps);
};

// #region Super properties builders

export const buildItwSuperProperties = (
  state: GlobalState
): Pick<ITWSuperProperties, "OFFLINE_ACCESS_REASON"> => ({
  OFFLINE_ACCESS_REASON: offlineReasonHandler(state)
});

// #endregion

// #region Utility functions

const offlineReasonHandler = (
  state: GlobalState
): OfflineAccessReasonEnum | "not_available" => {
  const offlineAccessReason = offlineAccessReasonSelector(state);
  return offlineAccessReason ? offlineAccessReason : "not_available";
};

// #endregion
