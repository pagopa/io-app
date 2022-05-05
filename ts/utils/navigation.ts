// gets the current screen from navigation state
import { navigationRef } from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";

/**
 * @deprecated
 */
export const isOnboardingCompleted = () => {
  const route = navigationRef?.current?.getRootState();
  if (route === null) {
    return false;
  }
  return route?.routes[0].name === ROUTES.MAIN;
};

export const appProtocolRouterV2 = "ioapp://";

export const isCTAv2 = (path: string) => path.startsWith(appProtocolRouterV2);

export const convertUrlToNavigationLink = (path: string) =>
  path.replace(appProtocolRouterV2, "/");
