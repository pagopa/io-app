import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { SpidIdp } from "../../../../../utils/idps";

export type LoginType = "auth" | "reauth";

export function trackLoginWithNewCF() {
  void mixpanelTrack(
    "LOGIN_NEW_CF",
    buildEventProperties("UX", "screen_view", {
      flow: "reauth"
    })
  );
}

export function trackLoginWithNewCFConfirm() {
  void mixpanelTrack(
    "LOGIN_NEW_CF_CONFIRM",
    buildEventProperties("UX", "action", {
      flow: "reauth"
    })
  );
}

export function trackLoginReauthEngagement() {
  void mixpanelTrack(
    "LOGIN_REAUTH_ENGAGEMENT",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackLoginReauthEngagementDismissed() {
  void mixpanelTrack(
    "LOGIN_REAUTH_ENGAGEMENT_DISMISSED",
    buildEventProperties("UX", "action")
  );
}

export function trackLoginReauthEngagementCieSelected() {
  void mixpanelTrack(
    "LOGIN_REAUTH_ENGAGEMENT_CIE_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackLoginReauthEngagementSpidSelected() {
  void mixpanelTrack(
    "LOGIN_REAUTH_ENGAGEMENT_SPID_SELECTED",
    buildEventProperties("UX", "action")
  );
}

export function trackSpidLoginIntent(
  idpName: SpidIdp | undefined,
  flow: LoginType = "auth"
) {
  void mixpanelTrack(
    "SPID_LOGIN_INTENT",
    buildEventProperties("TECH", undefined, {
      idp: idpName,
      flow
    })
  );
}
