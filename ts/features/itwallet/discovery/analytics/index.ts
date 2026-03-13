import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwCredentialDetails, ItwFlow } from "../../analytics/utils/types";
import {
  ITW_DISCOVERY_ACTIONS_EVENTS,
  ITW_DISCOVERY_ERRORS_EVENTS
} from "./enum";

export const trackItWalletActivationStart = (
  itw_flow: ItwFlow,
  credential_details: ItwCredentialDetails
) => {
  void mixpanelTrack(
    ITW_DISCOVERY_ACTIONS_EVENTS.ITW_ID_START,
    buildEventProperties("UX", "action", { itw_flow, credential_details })
  );
};

export const trackItwIntroBack = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_DISCOVERY_ACTIONS_EVENTS.ITW_INTRO_BACK,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackOpenItwTosAccepted = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_DISCOVERY_ACTIONS_EVENTS.ITW_TOS_ACCEPTED,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackItwDiscoveryPlus = () => {
  void mixpanelTrack(
    ITW_DISCOVERY_ACTIONS_EVENTS.ITW_DISCOVERY_PLUS,
    buildEventProperties("UX", "action", { itw_flow: "L3" })
  );
};

export const trackItwAlreadyActivated = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_DISCOVERY_ERRORS_EVENTS.ITW_ALREADY_ACTIVATED,
    buildEventProperties("KO", "error", { itw_flow })
  );
};

export const trackItwNfcNotSupported = () => {
  void mixpanelTrack(
    ITW_DISCOVERY_ERRORS_EVENTS.ITW_NFC_NOT_SUPPORTED,
    buildEventProperties("KO", "screen_view")
  );
};
