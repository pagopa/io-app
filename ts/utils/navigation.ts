// gets the current screen from navigation state

import { index } from "fp-ts/lib/Array";
import { fromNullable, none, Option } from "fp-ts/lib/Option";
import {
  NavigationLeafRoute,
  NavigationRoute,
  NavigationState
} from "react-navigation";
import { NavigationHistoryState } from "../store/reducers/navigationHistory";

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
 * @deprecated
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
 * @deprecated
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
 * This function returns the route name from a given NavigationRoute param
 * using recursion to navigate through the object until the leaf node
 * @deprecated
 */
export function getRouteName(route: NavigationRoute): Option<string> {
  if (route.index === undefined) {
    return fromNullable(route.routeName);
  }
  if (route.index >= route.routes.length) {
    return none;
  }
  return getRouteName(route.routes[route.index]);
}

/**
 * This function returns the name of the precedent navigation route to understand
 * from where the current route has been navigated
 * @deprecated
 */
export function whereAmIFrom(nav: NavigationHistoryState): Option<string> {
  const navLength = nav.length;
  return index(navLength - 1, [...nav]).fold(none, ln =>
    getRouteName(ln.routes[ln.index])
  );
}
