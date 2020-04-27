// gets the current screen from navigation state

import { none, Option, some } from "fp-ts/lib/Option";
import { NavigationRoute } from "react-navigation";
import { NavigationHistoryState } from "../store/reducers/navigationHistory";

// TODO: Need to be fixed https://www.pivotaltracker.com/story/show/170819360
export function getCurrentRouteName(navNode: any): string | undefined {
  if (!navNode) {
    return undefined;
  }
  if (
    navNode.index === undefined &&
    navNode.routeName &&
    typeof navNode.routeName === "string"
  ) {
    // navNode is a NavigationLeafRoute
    return navNode.routeName;
  }
  if (
    navNode.routes &&
    navNode.index !== undefined &&
    navNode.routes[navNode.index]
  ) {
    const route = navNode.routes[navNode.index];
    return getCurrentRouteName(route);
  }
  return undefined;
}

export function getCurrentRouteKey(navNode: any): string | undefined {
  if (!navNode) {
    return undefined;
  }
  if (
    navNode.index === undefined &&
    navNode.key &&
    typeof navNode.key === "string"
  ) {
    // navNode is a NavigationLeafRoute
    return navNode.key;
  }
  if (
    navNode.routes &&
    navNode.index !== undefined &&
    navNode.routes[navNode.index]
  ) {
    const route = navNode.routes[navNode.index];
    return getCurrentRouteKey(route);
  }
  return undefined;
}

export function getRouteName(route: NavigationRoute): Option<string> {
  if (route.index === undefined) {
    return route.routeName ? some(route.routeName) : none;
  }
  if (route.index >= route.routes.length) {
    return none;
  }
  return getRouteName(route.routes[route.index]);
}

export function whereAmIFrom(nav: NavigationHistoryState): Option<string> {
  if (nav.length === 0) {
    return none;
  }
  const navLength = nav.length;
  const lastStep = nav[navLength - 1].routes[nav[navLength - 1].index];
  return getRouteName(lastStep);
}
