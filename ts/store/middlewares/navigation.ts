import { mixpanelTrack } from "../../mixpanel";
import { noAnalyticsRoutes } from "../../utils/analytics";

export const trackScreen = (
  previousScreen: string | undefined,
  currentScreen: string
) => {
  if (previousScreen !== currentScreen) {
    // track only those events that are not included in the blacklist
    if (!noAnalyticsRoutes.has(currentScreen)) {
      void mixpanelTrack("SCREEN_CHANGE_V2", {
        SCREEN_NAME: currentScreen
      });
    }
    // send to 10-days retention project
    void mixpanelTrack("SCREEN_CHANGE", {
      SCREEN_NAME: currentScreen
    });
  }
};
