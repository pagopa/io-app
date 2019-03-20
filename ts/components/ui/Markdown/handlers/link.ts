import { Linking } from "react-native";

import { Dispatch } from "../../../../store/actions/types";
import { handleInternalLink, IO_INTERNAL_LINK_PREFIX } from "./internalLink";

/**
 * Handles links clicked in the Markdown (webview) component.
 * Internal links handling is demanded to the `handleInternalLink` function.
 */
export function handleLinkMessage(dispatch: Dispatch, href: string) {
  if (href.startsWith(IO_INTERNAL_LINK_PREFIX)) {
    handleInternalLink(dispatch, href);
  } else {
    // External urls must be opened with the OS browser.
    // FIXME: Whitelist allowed domains: https://www.pivotaltracker.com/story/show/158470128
    Linking.openURL(href).catch(() => 0);
  }
}
