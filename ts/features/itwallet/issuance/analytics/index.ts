import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { MixPanelCredential } from "../../analytics";
import { ITW_ACTIONS_EVENTS } from "../../analytics/enum";
import { TrackCredentialPreview } from "../../analytics/utils/analyticsTypes";
import { ITW_ISSUANCE_ACTIONS_EVENTS, ITW_ISSUANCE_SCREENVIEW_EVENTS } from "./enum";

export const trackCredentialPreview = (
  credentialPreview: TrackCredentialPreview
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_SCREENVIEW_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", credentialPreview)
  );
};

export const trackItwCredentialIntro = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ISSUANCE_SCREENVIEW_EVENTS.ITW_CREDENTIAL_INTRO,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

export const trackAddFirstCredential = () => {
  void mixpanelTrack(
    ITW_ISSUANCE_ACTIONS_EVENTS.ITW_ADD_FIRST_CREDENTIAL,
    buildEventProperties("UX", "action")
  );
};

export const trackSaveCredentialToWallet = (credential: MixPanelCredential) => {
  if (credential) {
    void mixpanelTrack(
      ITW_ACTIONS_EVENTS.ITW_UX_CONVERSION,
      buildEventProperties("UX", "action", { credential })
    );
  }
};
