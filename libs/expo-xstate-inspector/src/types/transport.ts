import type { InspectorMessages, InspectorMethod } from "./messages";

export type InspectorTransport = {
  /** Calls `listener` whenever a web page connects. */
  onConnected: (listener: () => void) => void;
  send: <M extends InspectorMethod>(
    method: M,
    payload: InspectorMessages[M]
  ) => void;
};
