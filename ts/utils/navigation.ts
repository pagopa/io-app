// gets the current screen from navigation state
import { NavigationState, PartialState } from "@react-navigation/native";
import { Platform } from "react-native";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

export const IO_UNIVERSAL_LINK_PREFIX = "https://continua.io.pagopa.it";

/**
 * This variable should be used on every `gestureEnabled` setting
 * in the navigator. This prevents the gestures to be enabled on Android
 * creating glitches with the scroll on old Android versions (version 9 and below).
 */
export const isGestureEnabled = Platform.OS !== "android";

type NavigationStateLike =
  | NavigationState
  | PartialState<NavigationState>
  | undefined;

/**
 * Checks whether a route is present anywhere in a navigation state tree.
 *
 * React Navigation can nest navigator states inside route objects, so checking
 * only the top-level routes is not enough when looking for screens rendered by
 * nested navigators.
 */
export const isRouteInNavigationState = (
  state: NavigationStateLike,
  routeName: string
): boolean =>
  state?.routes.some(
    route =>
      route.name === routeName ||
      isRouteInNavigationState(route.state, routeName)
  ) ?? false;
