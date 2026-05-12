import { getType } from "typesafe-actions";
import {
  getPeople,
  isMixpanelInstanceInitialized,
  registerSuperProperties
} from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  resetOfflineAccessReason,
  setOfflineAccessReason
} from "../../../ingress/store/actions";
import {
  itwAuthLevelSelector,
  itwIdentificationModeSelector
} from "../../common/store/selectors/preferences";
import { isItwAnalyticsCredential } from "../utils";
import { MixPanelCredential } from "../utils/types";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import {
  buildItwBaseProperties,
  buildPidProperties,
  buildThirdPartyCredentialProperty,
  buildWalletListCredentialProperty,
  computeItwStatus
} from "./basePropertyBuilder";
import {
  forceUpdateItwProfileProperties,
  ItwProfileProperties
} from "./profileProperties";
import {
  ITW_ANALYTICS_CREDENTIALS,
  ItwAnalyticsCredential,
  WalletRevokedAnalyticsEvent
} from "./propertyTypes";
import {
  buildItwSuperProperties,
  forceUpdateItwSuperProperties,
  ItwSuperProperties
} from "./superProperties";

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

export const updateItwStatusAndPIDProperties = (state: GlobalState) => {
  const authLevel = itwAuthLevelSelector(state);
  if (!authLevel) {
    return;
  }

  const pidProperties = buildPidProperties(state);

  const properties = {
    ITW_STATUS_V2: computeItwStatus(
      authLevel,
      itwIdentificationModeSelector(state),
      itwLifecycleIsITWalletValidSelector(state)
    ),
    ...pidProperties
  };

  forceUpdateItwProfileProperties(properties);
  forceUpdateItwSuperProperties(properties);
};

/**
 * This function is used to set all to not_available / not_active when wallet
 * is revoked or when the wallet section is visualized in empty state
 */
export const updatePropertiesWalletRevoked = () => {
  const credentialsResetProps = Object.fromEntries(
    ITW_ANALYTICS_CREDENTIALS.map(c => [c, "not_available"])
  ) as Record<ItwAnalyticsCredential, "not_available">;

  const finalProps: WalletRevokedAnalyticsEvent = {
    ...credentialsResetProps,
    ITW_STATUS_V2: "not_active",
    ITW_THIRD_PARTY_CREDENTIAL: "not_available",
    ITW_WALLET_LIST_CREDENTIAL: "not_available"
  };

  forceUpdateItwProfileProperties(finalProps);
  forceUpdateItwSuperProperties(finalProps);
};

export const updateCredentialProperties = (
  credential: MixPanelCredential,
  status: "valid" | "not_available"
) => {
  if (!isItwAnalyticsCredential(credential)) {
    return;
  }

  forceUpdateItwProfileProperties({
    [credential]: status
  });

  forceUpdateItwSuperProperties({
    [credential]: status
  });
};

/**
 * Track the reason for offline access on Mixpanel
 * @param action - The action that was dispatched
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

/**
 * Recomputes and syncs the aggregate third-party credential property.
 * It must update both Profile and Super properties so future events and user
 * profile data stay aligned after credential store/remove operations.
 */
export const updateThirdPartyCredentialProperty = (state: GlobalState) => {
  const thirdPartyCredentialProperty = buildThirdPartyCredentialProperty(state);
  const walletListCredentialProperty = buildWalletListCredentialProperty(state);
  forceUpdateItwProfileProperties({
    ITW_THIRD_PARTY_CREDENTIAL: thirdPartyCredentialProperty,
    ITW_WALLET_LIST_CREDENTIAL: walletListCredentialProperty
  });
  forceUpdateItwSuperProperties({
    ITW_THIRD_PARTY_CREDENTIAL: thirdPartyCredentialProperty,
    ITW_WALLET_LIST_CREDENTIAL: walletListCredentialProperty
  });
};
