import { mixpanelTrack } from "../../mixpanel";

export const trackScreen = (
  previousScreen: string | undefined,
  currentScreen: string
) => {
  if (previousScreen !== currentScreen) {
    // send to 10-days retention project
    void mixpanelTrack("SCREEN_CHANGE", {
      SCREEN_NAME: currentScreen
    });
  }
};
