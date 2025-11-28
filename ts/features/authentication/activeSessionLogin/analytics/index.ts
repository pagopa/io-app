import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../../config";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

export const BANNER_ID = "SESSION_ABOUT_TO_EXPIRE";
const BANNER_CAMPAIGN = "LV";

export function trackLoginExpirationBannerPrompt() {
  void mixpanelTrack(
    "BANNER",
    buildEventProperties("UX", "screen_view", {
      banner_id: BANNER_ID,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: helpCenterHowToDoWhenSessionIsExpiredUrl,
      banner_campaign: BANNER_CAMPAIGN
    })
  );
}

export function trackLoginExpirationBannerClosure() {
  void mixpanelTrack(
    "CLOSE_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: BANNER_ID,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: helpCenterHowToDoWhenSessionIsExpiredUrl,
      banner_campaign: BANNER_CAMPAIGN
    })
  );
}

export function trackSessionCorrupted() {
  void mixpanelTrack(
    "SESSION_CORRUPTED",
    buildEventProperties("TECH", "error")
  );
}
