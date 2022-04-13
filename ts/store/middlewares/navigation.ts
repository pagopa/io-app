import { NavigationState } from "react-navigation";
import { mixpanelTrack } from "../../mixpanel";
import { noAnalyticsRoutes } from "../../utils/analytics";
import { getCurrentRouteName } from "../../utils/navigation";

export const trackScreen = (
  previousState: NavigationState,
  currentState: NavigationState
) => {
  const previousScreenName = getCurrentRouteName(previousState);
  const screenName = getCurrentRouteName(currentState);

  if (
    previousScreenName !== undefined &&
    screenName !== undefined &&
    previousScreenName !== screenName
  ) {
    // track only those events that are not included in the blacklist
    if (!noAnalyticsRoutes.has(screenName)) {
      void mixpanelTrack("SCREEN_CHANGE_V2", {
        SCREEN_NAME: screenName
      });
    }
    // sent to 10-days retention project
    void mixpanelTrack("SCREEN_CHANGE", {
      SCREEN_NAME: screenName
    });
  }
};
