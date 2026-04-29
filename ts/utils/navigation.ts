// gets the current screen from navigation state
import { NavigationState, PartialState } from "@react-navigation/native";
import { Platform } from "react-native";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

export const IO_UNIVERSAL_LINK_PREFIX = "https://continua.io.pagopa.it";

/**
 * This variable should be used on every `gestureEnabled` setting in the
 * navigator. This prevents the gestures to be enabled on Android creating
 * glitches with the scroll on old Android versions (version 9 and below).
 */
export const isGestureEnabled = Platform.OS !== "android";

type NavigationStateLike =
  | NavigationState
  | PartialState<NavigationState>
  | undefined;

/**
 * Checks whether a route is present in the user's active navigation path.
 *
 * Only traverses routes that are part of the current navigation path:
 * - Tab/drawer navigators: only the active tab is considered in-path; inactive
 *   tabs are excluded even if they were visited previously.
 * - Stack navigators: all routes up to and including the active index are
 *   considered in-path because the user can navigate back through them.
 */
export const isRouteInNavigationState = (
  state: NavigationStateLike,
  routeName: string
): boolean => {
  if (!state?.routes?.length) {
    return false;
  }

  const activeIndex = state.index ?? state.routes.length - 1;

  // For tab and drawer navigators, only the active tab is in the user's current
  // navigation path. For stack navigators (or unknown types), all routes up to
  // the active index are reachable via back navigation and count as in-path.
  const routesToCheck =
    state.type === "tab" || state.type === "drawer"
      ? [state.routes[activeIndex]]
      : state.routes.slice(0, activeIndex + 1);

  return routesToCheck
    .filter(Boolean)
    .some(
      route =>
        route.name === routeName ||
        isRouteInNavigationState(route.state, routeName)
    );
};
