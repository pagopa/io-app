import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import PN_ROUTES from "../navigation/routes";

const bannerShown = () => {
  void mixpanelTrack(
    "BANNER",
    buildEventProperties("UX", "screen_view", {
      banner_id: "SEND_ACTIVATION_REMINDER",
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
    })
  );
};
const bannerTap = () => {
  void mixpanelTrack(
    "TAP_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: "SEND_ACTIVATION_REMINDER",
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
    })
  );
};
const bannerClose = () => {
  void mixpanelTrack(
    "CLOSE_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: "SEND_ACTIVATION_REMINDER",
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
    })
  );
};

const bannerKO = (reason: string) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_FAILURE",
    buildEventProperties("KO", "error", {
      reason
    })
  );
};
const alreadyActive = () => {
  void mixpanelTrack(
    "SEND_ALREADY_ACTIVE",
    buildEventProperties("UX", "screen_view")
  );
};
const activationSuccess = () => {
  void mixpanelTrack(
    "SEND_BANNER_ACTIVATION_UX_SUCCESS",
    buildEventProperties("UX", "screen_view")
  );
};
const activationStart = () => {
  void mixpanelTrack(
    "SEND_BANNER_ACTIVATION_START",
    buildEventProperties("UX", "action")
  );
};

export const sendBannerMixpanelEvents = {
  bannerShown,
  bannerTap,
  bannerClose,
  bannerKO,
  alreadyActive,
  activationSuccess,
  activationStart
};
