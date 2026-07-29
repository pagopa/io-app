import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";

export const trackLandingScreenMultiBannerImpression = (
  bannerId: string,
  bannerLanding: string
) => {
  void mixpanelTrack(
    "BANNER",
    buildEventProperties("UX", "screen_view", {
      banner_id: bannerId,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: bannerLanding
    })
  );
};

export const trackLandingScreenMultiBannerTap = (
  bannerId: string,
  bannerLanding: string
) => {
  void mixpanelTrack(
    "TAP_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: bannerId,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: bannerLanding
    })
  );
};
export const trackLandingScreenMultiBannerClosure = (
  bannerId: string,
  bannerLanding: string
) => {
  void mixpanelTrack(
    "CLOSE_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: bannerId,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: bannerLanding
    })
  );
};
