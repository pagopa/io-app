import { mixpanelTrack } from "../../mixpanel";

export const trackNavigationServiceInitializationTimeout = () => {
  void mixpanelTrack("NAVIGATION_SERVICE_INITIALIZATION_TIMEOUT");
};

export const trackNavigationServiceInitializationCompleted = (
  elapsedTime: number
) => {
  void mixpanelTrack("NAVIGATION_SERVICE_INITIALIZATION_COMPLETED", {
    elapsedTime
  });
};

export const trackMainNavigatorStackReadyTimeout = () => {
  void mixpanelTrack("MAIN_NAVIGATOR_STACK_READY_TIMEOUT");
};

export const trackMainNavigatorStackReadyOk = (elapsedTime: number) => {
  void mixpanelTrack("MAIN_NAVIGATOR_STACK_READY_OK", {
    elapsedTime
  });
};
