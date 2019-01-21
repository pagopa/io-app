/**
 * Types of messages sent from inside the webview.
 */

import * as t from "io-ts";

const LinkMessage = t.type({
  type: t.literal("LINK_MESSAGE"),
  payload: t.type({
    href: t.string
  })
});

const ResizeMessage = t.type({
  type: t.literal("RESIZE_MESSAGE"),
  payload: t.type({
    height: t.number
  })
});

export const WebViewMessage = t.taggedUnion("type", [
  LinkMessage,
  ResizeMessage
]);
