/**
 * Types of messages sent from inside the webview.
 */

import * as t from "io-ts";

export const WebViewMessage = t.type({
  type: t.literal("LINK_MESSAGE"),
  payload: t.type({
    href: t.string
  })
});
