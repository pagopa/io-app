// gets the current screen from navigation state
import { Platform } from "react-native";
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

export const convertUrlToNavigationLink = (path: string) =>
  path.replace(IO_INTERNAL_LINK_PREFIX, "/");

/**
 * This variable should be used on every `gestureEnabled` setting
 * in the navigator. This prevents the gestures to be enabled on Android
 * creating glitches with the scroll on old Android versions (version 9 and below).
 */
export const isGestureEnabled = Platform.OS !== "android";
