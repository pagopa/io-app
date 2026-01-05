import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwFlow } from "../../analytics/utils/analyticsTypes";
import {
  ITW_DISCOVERY_ACTIONS_EVENTS,
  ITW_DISCOVERY_ERRORS_EVENTS
} from "./enum";

// #region ACTIONS

export const trackItWalletActivationStart = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_DISCOVERY_ACTIONS_EVENTS.ITW_ID_START,
    buildEventProperties("UX", "action", { itw_flow })
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

// #endregion ACTIONS

// #region ERRORS

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

// #endregion ERRORS
