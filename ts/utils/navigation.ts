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
