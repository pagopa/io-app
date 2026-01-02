import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  ItwEidReissuingTrigger,
  MixPanelCredential,
  TrackCredentialDetail
} from "../../../analytics/utils/analyticsTypes";
import {
  ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS,
  ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS
} from "./enum";

// #region SCREEN VIEW EVENTS

export const trackCredentialDetail = (
  credentialDetails: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS.ITW_CREDENTIAL_DETAIL,
    buildEventProperties("UX", "screen_view", credentialDetails)
  );
};

export const trackWalletCredentialFAC_SIMILE = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS["ITW_CREDENTIAL_FAC-SIMILE"],
    buildEventProperties("UX", "screen_view", { credential })
  );
};

export const trackItwCredentialBottomSheet = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

export const trackItwCredentialDelete = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_DELETE,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackItwCredentialBottomSheetAction = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET_ACTION,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackWalletShowBack = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_BACK,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackWalletCredentialSupport = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_SUPPORT,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackWalletCredentialShowFAC_SIMILE = () => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS["ITW_CREDENTIAL_SHOW_FAC-SIMILE"],
    buildEventProperties("UX", "action", { credential: "ITW_TS_V2" })
  );
};

// ITW_CREDENTIAL_SHOW_TRUSTMARK
export const trackWalletCredentialShowTrustmark = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_TRUSTMARK,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackCredentialCardModal = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_CARD_MODAL,
    buildEventProperties("UX", "action", {
      credential,
      credential_status: "valid"
    })
  );
};

export const trackItwCredentialTapBanner = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_CREDENTIAL_TAP_BANNER,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItwEidReissuingMandatory = (
  action: ItwEidReissuingTrigger
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_ACTIONS_EVENTS.ITW_REISSUING_EID_MANDATORY,
    buildEventProperties("KO", "screen_view", { action })
  );
};

// #endregion ACTIONS
