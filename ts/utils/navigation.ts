// gets the current screen from navigation state
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
