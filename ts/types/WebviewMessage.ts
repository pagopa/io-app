/**
 * these models describe the incoming data sent from web pages that include app injected JS (see RegionServiceWebView)
 */
import * as t from "io-ts";

export const AlertContent = t.interface({
  title: t.string,
  description: t.string
});
export type AlertContent = t.TypeOf<typeof AlertContent>;

const AlertPayloadR = t.interface({
  type: t.literal("SHOW_ALERT"),
  en: AlertContent
});
const AlertPayloadO = t.partial({
  it: AlertContent
});

export const AlertPayload = t.intersection(
  [AlertPayloadR, AlertPayloadO],
  "AlertPayload"
);

const SuccessPayloadR = t.interface({
  type: t.union([t.literal("SHOW_SUCCESS"), t.literal("SHOW_ERROR")]),
  en: t.string
});
const SuccessPayloadO = t.partial({
  it: t.string
});
export const SuccessPayload = t.intersection(
  [SuccessPayloadR, SuccessPayloadO],
  "SuccessPayload"
);

const EmptyPayloadMessage = t.interface({
  type: t.union([
    t.literal("CLOSE_MODAL"),
    t.literal("START_LOAD"),
    t.literal("END_LOAD")
  ])
});

export const WebviewMessage = t.taggedUnion(
  "type",
  [AlertPayload, SuccessPayload, EmptyPayloadMessage],
  "WebviewMessage"
);
export type WebviewMessage = t.TypeOf<typeof WebviewMessage>;
