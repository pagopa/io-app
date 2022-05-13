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

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

export const isCTAv2 = (path: string) =>
  path.startsWith(IO_INTERNAL_LINK_PREFIX);

export const convertUrlToNavigationLink = (path: string) =>
  path.replace(IO_INTERNAL_LINK_PREFIX, "/");
