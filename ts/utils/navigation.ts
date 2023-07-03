// gets the current screen from navigation state
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Platform } from "react-native";
import { extractPathFromURL } from "./url";

// Prefix to match deeplink uri like `ioit://PROFILE_MAIN`
export const IO_INTERNAL_LINK_PROTOCOL = "ioit:";
export const IO_INTERNAL_LINK_PREFIX = IO_INTERNAL_LINK_PROTOCOL + "//";

export const IO_FIMS_LINK_PROTOCOL = "iosso:";
export const IO_FIMS_LINK_PREFIX = IO_FIMS_LINK_PROTOCOL + "//";

export const IO_UNIVERSAL_LINK_PREFIX = "https://continua.io.pagopa.it";

/**
 * Extracts the internal route from a deeplink only if it starts with the supported prefix
 * @param href deeplink to extract the internal route from
 * @returns the internal route if found, `none` otherwise
 */
export function extractInternalPath(href: string): string | undefined {
  return pipe(
    extractPathFromURL(
      [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX, IO_FIMS_LINK_PREFIX],
      href
    ),
    O.fromNullable,
    O.map(path => (path.startsWith("/") ? path : "/" + path)),
    O.toUndefined
  );
}

/**
 * This variable should be used on every `gestureEnabled` setting
 * in the navigator. This prevents the gestures to be enabled on Android
 * creating glitches with the scroll on old Android versions (version 9 and below).
 */
export const isGestureEnabled = Platform.OS !== "android";
