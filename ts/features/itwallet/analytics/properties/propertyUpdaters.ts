import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { MixPanelCredential } from "..";
import {
  setOfflineAccessReason,
  resetOfflineAccessReason
} from "../../../ingress/store/actions";
import {
  getPeople,
  isMixpanelInstanceInitialized,
  registerSuperProperties
} from "../../../../mixpanel";
import { isItwAnalyticsCredential } from "../utils/analyticsUtils";
import {
  ItwProfileProperties,
  forceUpdateItwProfileProperties
} from "./profileProperties";
import {
  buildItwBaseProperties,
  getPIDMixpanelStatus
} from "./basePropertyBuilder";
import {
  ItwSuperProperties,
  buildItwSuperProperties,
  forceUpdateItwSuperProperties
} from "./superProperties";
import {
  ItwAnalyticsCredential,
  ITW_ANALYTICS_CREDENTIALS,
  WalletRevokedAnalyticsEvent
} from "./propertyTypes";

/**
 * Performs a full sync of all ITW analytics properties
 * (Profile + Super) using a single state interpretation.
 */
export const updateItwAnalyticsProperties = (state: GlobalState) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  const baseProps = buildItwBaseProperties(state);
  const superProps = buildItwSuperProperties(state);

  updateItwProfilePropertiesWithProps(baseProps);
  updateItwSuperPropertiesWithProps({
    ...baseProps,
    ...superProps
  });
};

const updateItwProfilePropertiesWithProps = (props: ItwProfileProperties) => {
  getPeople()?.set(props);
};

const updateItwSuperPropertiesWithProps = (props: ItwSuperProperties) => {
  registerSuperProperties(props);
};

export const updateITWStatusAndPIDProperties = (state: GlobalState) => {
  const authLevel = itwAuthLevelSelector(state);
  if (!authLevel) {
    return;
  }

  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
  const eIDStatus = !isItwL3 ? getPIDMixpanelStatus(state, false) : undefined;
  const pidStatus = getPIDMixpanelStatus(state, true);

  const baseProps = {
    ITW_STATUS_V2: authLevel,
    ITW_PID: pidStatus
  };

  forceUpdateItwProfileProperties({
    ...baseProps,
    ...(eIDStatus ? { ITW_ID_V2: eIDStatus } : {})
  });

  forceUpdateItwSuperProperties({
    ...baseProps,
    ...(eIDStatus ? { ITW_ID_V2: eIDStatus } : {})
  });
};

/**
 * This function is used to set all to not_available / not_active when wallet
 * is revoked or when the wallet section is visualized in empty state
 * @param state
 */
export const updatePropertiesWalletRevoked = () => {
  const credentialsResetProps = Object.fromEntries(
    ITW_ANALYTICS_CREDENTIALS.map(c => [c, "not_available"])
  ) as Record<ItwAnalyticsCredential, "not_available">;

  const finalProps: WalletRevokedAnalyticsEvent = {
    ...credentialsResetProps,
    ITW_STATUS_V2: "not_active"
  };

  forceUpdateItwProfileProperties(finalProps);
  forceUpdateItwSuperProperties(finalProps);
};

export const updateCredentialDeletedProperties = (
  credential: MixPanelCredential
) => {
  if (!isItwAnalyticsCredential(credential)) {
    return;
  }
  forceUpdateItwProfileProperties({
    [credential]: "not_available"
  });
  forceUpdateItwSuperProperties({
    [credential]: "not_available"
  });
};

export const updateCredentialAddedProperties = (
  credential: MixPanelCredential
) => {
  if (!isItwAnalyticsCredential(credential)) {
    return;
  }
  forceUpdateItwProfileProperties({
    [credential]: "valid"
  });
  forceUpdateItwSuperProperties({
    [credential]: "valid"
  });
};

/**
 * Track the reason for offline access on Mixpanel
 * @param action - The action that was dispatched
 * @param state - The current state of the application
 */
export const updateOfflineAccessReason = (
  action: Action
): void | ReadonlyArray<null> => {
  switch (action.type) {
    case getType(setOfflineAccessReason):
      forceUpdateItwSuperProperties({
        OFFLINE_ACCESS_REASON: action.payload
      });
      break;

    case getType(resetOfflineAccessReason):
      forceUpdateItwSuperProperties({
        OFFLINE_ACCESS_REASON: "not_available"
      });
  }
};
