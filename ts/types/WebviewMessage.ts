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
export type AlertPayload = t.TypeOf<typeof AlertPayload>;

export const ToastContentR = t.interface({
  text: t.string
});
export const ToastContentO = t.partial({
  type: t.union([
    t.literal("danger"),
    t.literal("success"),
    t.literal("warning")
  ])
});

export const ToastContent = t.intersection(
  [ToastContentR, ToastContentO],
  "ToastContent"
);
export type ToastContent = t.TypeOf<typeof ToastContent>;

const ToastPayloadR = t.interface({
  type: t.literal("SHOW_TOAST"),
  en: ToastContent
});
const ToastPayloadO = t.partial({
  it: ToastContent
});

export const ToastPayload = t.intersection(
  [ToastPayloadR, ToastPayloadO],
  "ToastPayload"
);
export type ToastPayload = t.TypeOf<typeof ToastPayload>;

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

const TitlePayloadR = t.interface({
  type: t.literal("SET_TITLE"),
  en: t.string
});
const TitlePayloadO = t.partial({
  it: t.string
});

export const TitlePayload = t.intersection(
  [TitlePayloadR, TitlePayloadO],
  "TitlePayload"
);
export type TitlePayload = t.TypeOf<typeof TitlePayload>;

const EmptyPayloadMessage = t.interface({
  type: t.union([
    t.literal("CLOSE_MODAL"),
    t.literal("START_LOAD"),
    t.literal("END_LOAD")
  ])
});

export const WebviewMessage = t.union([
  AlertPayload,
  ToastPayload,
  TitlePayload,
  SuccessPayload,
  EmptyPayloadMessage
]);
export type WebviewMessage = t.TypeOf<typeof WebviewMessage>;
