import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { MixPanelCredential } from "../../../analytics";
import { ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS } from "./enum";

export const trackCredentialDetail = (
  credentialDetails: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS.ITW_CREDENTIAL_DETAIL,
    buildEventProperties("UX", "screen_view", credentialDetails)
  );
};

export function trackWalletCredentialFAC_SIMILE(
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS["ITW_CREDENTIAL_FAC-SIMILE"],
    buildEventProperties("UX", "screen_view", { credential })
  );
}

export const trackItwCredentialBottomSheet = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// Region Actions

export const trackItwCredentialDelete = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_DELETE,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackItwCredentialBottomSheetAction = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET_ACTION,
    buildEventProperties("UX", "action", properties)
  );
};
