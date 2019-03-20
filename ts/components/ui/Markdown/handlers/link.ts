import { Linking } from "react-native";

import { Dispatch } from "../../../../store/actions/types";
import { handleInternalLink, IO_INTERNAL_LINK_PREFIX } from "./internalLink";

export function handleLinkMessage(dispatch: Dispatch, href: string) {
  if (href.startsWith(IO_INTERNAL_LINK_PREFIX)) {
    handleInternalLink(dispatch, href);
  } else {
    Linking.openURL(href).catch(() => 0);
  }
}
