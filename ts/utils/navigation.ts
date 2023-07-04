// gets the current screen from navigation state
import { Platform } from "react-native";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

export const IO_FIMS_LINK_PROTOCOL = "iosso:";
export const IO_FIMS_LINK_PREFIX = IO_FIMS_LINK_PROTOCOL + "//";

export const IO_UNIVERSAL_LINK_PREFIX = "https://continua.io.pagopa.it";

/**
 * This variable should be used on every `gestureEnabled` setting
 * in the navigator. This prevents the gestures to be enabled on Android
 * creating glitches with the scroll on old Android versions (version 9 and below).
 */
export const isGestureEnabled = Platform.OS !== "android";
