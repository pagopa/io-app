// gets the current screen from navigation state

import {
  NavigationLeafRoute,
  NavigationRoute,
  NavigationState
} from "react-navigation";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";

/**
 * Assuming that each and every NavigationRoute will eventually lead
 * to a NavigationLeafRoute.
 */
const findLeafRoute = (
  branchOrLeaf: NavigationRoute | undefined
): NavigationLeafRoute | undefined => {
  if (branchOrLeaf?.routes) {
    const { routes, index } = branchOrLeaf;
    return findLeafRoute(routes[index]);
  }
  // a branch without routes is assumed to be a leaf
  return branchOrLeaf;
};

/**
 * @param navState
 */
export function getCurrentRouteName(
  navState: NavigationState
): string | undefined {
  try {
    return findLeafRoute(navState.routes[navState.index])?.routeName;
  } catch {
    return undefined;
  }
}

/**
 * @param navState
 */
export function getCurrentRouteKey(
  navState: NavigationState
): string | undefined {
  try {
    return findLeafRoute(navState.routes[navState.index])?.key;
  } catch {
    return undefined;
  }
}

export const getCurrentRoute = (
  navState: NavigationState
): NavigationLeafRoute | undefined => {
  try {
    return findLeafRoute(navState.routes[navState.index]);
  } catch {
    return undefined;
  }
};

/**
 * @deprecated
 */
export const isOnboardingCompleted = () => {
  const route = NavigationService.getCurrentState();
  if (route === null) {
    return false;
  }
  return route.routes?.length > 0 && route.routes[0].routeName === ROUTES.MAIN;
};
