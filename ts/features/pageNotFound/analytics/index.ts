import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export const track404ErrorScreen = async () => {
  void mixpanelTrack("404_ERROR", buildEventProperties("KO", "screen_view"));
};

export const track404ErrorScreenUpdateAppButton = async () => {
  void mixpanelTrack(
    "404_ERROR_APP_UPDATE",
    buildEventProperties("UX", "action")
  );
};

export const track404ErrorScreenCloseButton = async () => {
  void mixpanelTrack("404_ERROR_CLOSE", buildEventProperties("UX", "action"));
};
